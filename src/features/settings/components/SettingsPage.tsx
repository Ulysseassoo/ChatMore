import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, InputGroup, InputLeftElement, Select, Switch, Text, Textarea, useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { MobileBackButton } from "@/app/layouts";
import { Avatar } from "@/components/Avatar";
import { IconCamera, IconChevron, IconLogout } from "@/components/icons";
import { signOut } from "@/features/auth/api";
import { USERNAME_PATTERN, useUsernameCheck } from "@/features/auth/hooks";
import { UsernameStatus } from "@/features/auth/components/UsernameStatus";
import { useRequiredUserId } from "@/features/auth/session";
import { updateMyProfile, uploadAvatar, type ProfileUpdate } from "@/features/profile/api";
import { profileKey, useBlocks, useMyProfile } from "@/features/profile/hooks";
import { roomsKey } from "@/features/rooms/hooks";
import type { OnlineVisibility } from "@/lib/types";
import { usePreferences } from "../preferences";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Box as="section" aria-label={title} borderRadius="16px" bg="cm.surface" border="1px solid" borderColor="cm.line" overflow="hidden">
			<Heading as="h2" fontSize="13px" fontWeight={600} color="cm.muted" textTransform="uppercase" letterSpacing="0.6px" px={5} pt={4} pb={1}>
				{title}
			</Heading>
			{children}
		</Box>
	);
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<Flex as="label" align="center" gap={4} minH="60px" px={5} py={3} borderTop="1px solid" borderColor="cm.line" _first={{ borderTop: "none" }} cursor="pointer">
			<Box flex={1}>
				<Text fontWeight={500}>{label}</Text>
				{hint && (
					<Text fontSize="sm" color="cm.subtle">
						{hint}
					</Text>
				)}
			</Box>
			{children}
		</Flex>
	);
}

function ProfileForm() {
	const myId = useRequiredUserId();
	const { data: me } = useMyProfile();
	const qc = useQueryClient();
	const toast = useToast();
	const fileRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState({ username: "", about: "", phone: "" });
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		if (me) setForm({ username: me.username, about: me.about, phone: me.phone ?? "" });
	}, [me]);

	const usernameState = useUsernameCheck(form.username, me?.username);
	const dirty = !!me && (form.username !== me.username || form.about !== me.about || form.phone !== (me.phone ?? ""));
	const invalid = !USERNAME_PATTERN.test(form.username.trim().toLowerCase()) || usernameState === "taken";

	const save = async (values: ProfileUpdate, success = "Profil enregistré") => {
		try {
			await updateMyProfile(myId, values);
			await qc.invalidateQueries({ queryKey: profileKey(myId) });
			void qc.invalidateQueries({ queryKey: roomsKey });
			toast({ title: success, status: "success", duration: 2000, position: "bottom" });
		} catch {
			toast({ title: "L'enregistrement a échoué.", status: "error", position: "bottom" });
		}
	};

	return (
		<Flex direction="column" gap={5}>
			<Flex align="center" gap={5} wrap="wrap">
				<Avatar name={me?.username ?? "?"} seed={myId} src={me?.avatar_url} size={96} />
				<Box>
					<Button leftIcon={<IconCamera size={18} />} isLoading={uploading} onClick={() => fileRef.current?.click()}>
						Changer la photo
					</Button>
					<Text mt={1.5} fontSize="sm" color="cm.subtle">
						JPG, PNG ou WebP. Redimensionnée automatiquement.
					</Text>
					<input
						ref={fileRef}
						type="file"
						hidden
						accept="image/jpeg,image/png,image/webp"
						onChange={async (e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (!file) return;
							setUploading(true);
							try {
								await save({ avatar_url: await uploadAvatar(myId, file) }, "Photo mise à jour");
							} catch {
								toast({ title: "La photo n'a pas pu être envoyée.", status: "error" });
							} finally {
								setUploading(false);
							}
						}}
					/>
				</Box>
			</Flex>

			<FormControl isInvalid={usernameState === "taken" || usernameState === "invalid"}>
				<FormLabel>Nom d'utilisateur</FormLabel>
				<InputGroup>
					<InputLeftElement h="50px" color="#9A9189" pointerEvents="none">
						@
					</InputLeftElement>
					<Input pl="34px" autoCapitalize="none" value={form.username} aria-describedby="settings-username-status" onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
				</InputGroup>
				<UsernameStatus state={usernameState} id="settings-username-status" />
			</FormControl>

			<FormControl>
				<FormLabel>Bio</FormLabel>
				<Textarea rows={3} maxLength={140} value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} />
				<Text textAlign="right" fontSize="xs" color="cm.subtle" mt={1}>
					{form.about.length} / 140
				</Text>
			</FormControl>

			<FormControl isInvalid={form.phone.length > 32}>
				<FormLabel>
					Téléphone{" "}
					<Text as="span" fontWeight={400} color="cm.subtle" fontSize="sm">
						facultatif, visible seulement par tes contacts
					</Text>
				</FormLabel>
				<Input type="tel" placeholder="+33 6 00 00 00 00" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
				<FormErrorMessage>32 caractères maximum</FormErrorMessage>
			</FormControl>

			<Flex justify="flex-end" gap={2}>
				<Button variant="ghost" isDisabled={!dirty} onClick={() => me && setForm({ username: me.username, about: me.about, phone: me.phone ?? "" })}>
					Annuler
				</Button>
				<Button
					variant="primary"
					isDisabled={!dirty || invalid}
					isLoading={saving}
					onClick={async () => {
						setSaving(true);
						await save({ username: form.username.trim().toLowerCase(), about: form.about, phone: form.phone.trim() || null });
						setSaving(false);
					}}
				>
					Enregistrer
				</Button>
			</Flex>
		</Flex>
	);
}

export function SettingsPage() {
	const myId = useRequiredUserId();
	const { data: me } = useMyProfile();
	const { data: blocks } = useBlocks();
	const qc = useQueryClient();
	const { reduceMotion, largeText, setReduceMotion, setLargeText } = usePreferences();

	const savePrivacy = async (values: ProfileUpdate) => {
		await updateMyProfile(myId, values).catch(() => undefined);
		void qc.invalidateQueries({ queryKey: profileKey(myId) });
	};

	return (
		<Box h="full" overflowY="auto">
			<Box maxW="680px" mx="auto" px={{ base: 4, lg: 8 }} pt={{ base: "max(12px, env(safe-area-inset-top))", lg: 10 }} pb={16}>
				<Flex align="center" gap={1} mb={6} ml={{ base: -2, lg: 0 }}>
					<MobileBackButton />
					<Heading as="h1" fontSize={{ base: "22px", lg: "26px" }} fontWeight={800}>
						Réglages
					</Heading>
				</Flex>

				<Flex direction="column" gap={6}>
					<Box as="section" aria-label="Profil">
						<Heading as="h2" fontSize="20px" fontWeight={700} mb={5}>
							Profil
						</Heading>
						<ProfileForm />
					</Box>

					<Section title="Confidentialité">
						<Row label="Confirmations de lecture" hint="Si tu les désactives, tu ne verras plus non plus celles des autres.">
							<Switch size="lg" isChecked={me?.read_receipts ?? true} onChange={(e) => savePrivacy({ read_receipts: e.target.checked })} />
						</Row>
						<Row label="Qui voit quand je suis en ligne" hint="Les personnes bloquées ne le voient jamais.">
							<Select w="auto" h="40px" bg="cm.raised" borderColor="cm.lineStrong" value={me?.show_online ?? "contacts"} onChange={(e) => savePrivacy({ show_online: e.target.value as OnlineVisibility })}>
								<option value="contacts">Mes contacts</option>
								<option value="nobody">Personne</option>
							</Select>
						</Row>
						<Flex as={RouterLink} to="/settings/blocked" align="center" gap={3} minH="60px" px={5} borderTop="1px solid" borderColor="cm.line" _hover={{ bg: "cm.raised" }}>
							<Text flex={1} fontWeight={500}>
								Utilisateurs bloqués
							</Text>
							<Text color="cm.subtle">{blocks?.length ?? ""}</Text>
							<IconChevron size={18} color="#A39A90" aria-hidden="true" />
						</Flex>
					</Section>

					<Section title="Accessibilité">
						<Row label="Réduire les animations" hint="S'applique aussi si ton système le demande.">
							<Switch size="lg" isChecked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
						</Row>
						<Row label="Texte plus grand">
							<Switch size="lg" isChecked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
						</Row>
					</Section>

					<Button variant="dangerGhost" size="lg" border="1px solid" borderColor="#4A2C26" leftIcon={<IconLogout size={20} />} onClick={() => void signOut()}>
						Se déconnecter
					</Button>
				</Flex>
			</Box>
		</Box>
	);
}
