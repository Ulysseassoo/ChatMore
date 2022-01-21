import React from "react"
import styled from "styled-components"
import { Search } from "@styled-icons/boxicons-regular/Search"

const SearchBar = () => {
	return (
		<Container>
			<Form>
				<Search />
				<Input type="text" />
			</Form>
		</Container>
	)
}

const Container = styled.div`
	height: 40px;
	background-color: ${({ theme }) => theme.primaryColor};
	border-bottom: 1px solid ${({ theme }) => theme.lineBreakColor};
`
const Form = styled.form`
	padding: 0.2rem 1rem;
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	gap: 0.75rem;
	& svg {
		width: 25px;
		height: 25px;
		color: ${({ theme }) => theme.textColor};
	}
`
const Input = styled.input`
	color: ${({ theme }) => theme.textColor};
	font-size: 1rem;
	width: 100%;
	background-color: transparent;
	border: none;
`
export default SearchBar
