import { motion } from "framer-motion"
import styled, { createGlobalStyle, css } from "styled-components"

export const GlobalStyles = createGlobalStyle`
/*
  1. Use a more-intuitive box-sizing model.
*/
*, *::before, *::after {
  box-sizing: border-box;
}
/*
  2. Remove default margin and padding
*/
* {
  margin: 0;
  padding: 0;
}
/*
  3. Allow percentage-based heights in the application
*/
html, body {
  height: 100%;
}
/*
  Typographic tweaks!
  4. Add accessible line-height
  5. Improve text rendering
*/
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
/*
  6. Improve media defaults
*/
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
/*
  7. Remove built-in form typography styles
*/
input, button, textarea, select {
  font: inherit;
}
/*
  8. Avoid text overflows
*/
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
/*
  9. Create a root stacking context
*/
#root, #__next {
  isolation: isolate;
}

/* Font Styles */
body {
  background-color: #191716;
  overflow: hidden;
}
p, span {
    font-family: 'Hind Guntur', sans-serif;
}

h1, h2 {
    font-family: 'Convergence', sans-serif;
}

`

type FlexContainer = {
	theme: any
	chat?: boolean
}

export const Main = styled(motion.main)<FlexContainer>`
	height: 100vh;
	overflow: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: ${({ theme }) => theme.primaryColor};
	${({ chat }) =>
		chat &&
		css`
			flex-direction: column;
			justify-content: initial;
		`}
`
