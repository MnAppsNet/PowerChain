import { color } from "framer-motion";

export const colors = {
  text: "#161A30",
  textDisabled: "#B6BBC4",
  lines: "#161A30",
  disabled: "#89CFF3",
  enabled: "#A0E9FF",
  background: "#CDF5FD",
  backgroundDark: "#00A9FF",
  white: "#EEF5FF"
};

export const styles = {
  main : {
    margin: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
  },
  input : {
    borderColor:colors.lines,
    borderRadius: 20
  },
  panel: {
    width: '100%',
    borderWidth: '2px',
    backgroundColor: colors.enabled,
    borderColor: colors.lines,
    color: colors.text,
    borderWidth:"0.2em",
    padding:"1em"
  },
  seperator: {
    backgroundColor: colors.disabled,
    color: colors.disabled,
    borderColor: colors.disabled,
    borderWidth: "0.1em"
  },
  logoText: {
    color:colors.text,
    fontSize:"2em",
    fontWeight:"bold"
  },
  headerText: {
    color:color.text,
    fontSize:"1.5em",
    fontWeight:"bold"
  },
  text:{
    color:color.text,
    fontSize:"1.2em"
  },
  button: {
    size:"md",
    variant:"solid",
    size:"md",
    borderWidth:"0.1em",
    borderColor:"black"
  },
  alert : {
    position: 'fixed',
    top: 0,
    opacity: '20%',
    left: 0,
    width: '100%',
    height: '10px',
    zIndex: 1000,
    outlineWidth: '2px',
    outlineStyle: 'solid'
  }
}

export default styles;