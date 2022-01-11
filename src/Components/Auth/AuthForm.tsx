import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import styled from "styled-components"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { updateSession, updateProfile } from "../../redux/user/userSlice"
import { supabase } from "../../supabaseClient"
import Button from "./Button"
import FormTitle from "./FormTitle"

type Props = {
	registerMode?: boolean
}

type FormData = {
	email: string
	password: string
	username?: string
}

const AuthForm = ({ registerMode }: Props) => {
	const dispatch = useAppDispatch()
	const selector = useAppSelector
	let navigate = useNavigate()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm()
	const onSubmit = async (data: FormData) => {
		try {
			if (registerMode) {
				console.log("yes")
				const { error } = await supabase.auth.signUp(data)
				if (error) throw error
			} else {
				const { error } = await supabase.auth.signIn(data)
				if (error) throw error
			}
			const session = supabase.auth.session()
			const user: any = session?.user
			if (registerMode) {
				const updates = {
					id: user.id,
					username: data.username,
					email: data.email,
					updated_at: new Date()
				}
				let { error, data: newData }: { error: any; data: any } = await supabase.from("profiles").upsert(updates, {
					returning: "representation" // Don't return the value after inserting
				})
				dispatch(updateProfile(newData[0]))
				if (error) {
					throw error
				}
			} else {
				let { error, data: newData }: { error: any; data: any } = await supabase.from("profiles").select("*").eq("id", user.id)
				dispatch(updateProfile(newData[0]))
				if (error) {
					throw error
				}
			}
			navigate("/")
			dispatch(updateSession(user))
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}
	if (registerMode) {
		return (
			<Container>
				<FormTitle title="come chat with anybody !" />
				<Form onSubmit={handleSubmit(onSubmit)}>
					<input type="text" placeholder="Username" {...register("username", { required: true, minLength: 3 })} />
					<input type="email" placeholder="Email" {...register("email", { required: true, minLength: 5 })} />
					<input type="password" placeholder="Password" {...register("password", { required: true, minLength: 6 })} />

					<Button type="submit" content="Register" isSubmitting={isSubmitting} />
				</Form>
			</Container>
		)
	}
	return (
		<Container>
			<FormTitle title="let's start with hello !" />
			<Form onSubmit={handleSubmit(onSubmit)}>
				<input type="email" placeholder="Email" {...register("email", { required: true, minLength: 5 })} />
				<input type="password" placeholder="Password" {...register("password", { required: true, minLength: 6 })} />

				<Button type="submit" content="Login" isSubmitting={isSubmitting} />
			</Form>
		</Container>
	)
}

const Container = styled.div`
	margin-top: 1rem;
	width: 100%;
	text-align: center;
`

const Form = styled.form`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.3rem;
	margin-top: 1rem;
	width: 100%;
	& input {
		width: 100%;
		padding: 0.6rem;
		border-radius: 10px;
		border: transparent;
		&:focus,
		&:active {
			outline: 2px solid ${({ theme }) => theme.accentColor};
		}
		&:last-child {
			margin-bottom: 2rem;
		}
		@media (max-width: 520px) {
			font-size: 0.9rem;
		}
	}
	@media (max-width: 520px) {
		padding: 1rem;
	}
`

export default AuthForm
