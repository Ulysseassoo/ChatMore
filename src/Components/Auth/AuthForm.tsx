import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styled from "styled-components"
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
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm()
	const onSubmit = async (data: FormData) => {
		console.log(data)
		try {
			if (registerMode) {
				console.log("yes")
				const { error } = await supabase.auth.signUp(data)
				console.log(error)
				if (error) throw error
			} else {
				const { error } = await supabase.auth.signIn(data)
				console.log(error)
				if (error) throw error
			}
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
	}
`

export default AuthForm
