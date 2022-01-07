import React from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"
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
	const onSubmit = (data: FormData) => console.log(data)
	console.log(errors)

	if (registerMode) {
		return (
			<Container>
				<FormTitle title="come chat with anybody !" />
				<Form onSubmit={handleSubmit(onSubmit)}>
					<input type="text" placeholder="Username" {...register("username", { required: true, min: 3 })} />
					<input type="email" placeholder="Email" {...register("email", { required: true, min: 5 })} />
					<input type="password" placeholder="Password" {...register("password", { required: true, min: 6 })} />

					<Button type="submit" content="Register" />
				</Form>
			</Container>
		)
	}
	return (
		<Container>
			<FormTitle title="let's start with hello !" />
			<Form onSubmit={handleSubmit(onSubmit)}>
				<input type="email" placeholder="Email" {...register("email", { required: true, min: 5 })} />
				<input type="password" placeholder="Password" {...register("password", { required: true, min: 6 })} />

				<Button type="submit" content="Login" />
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
