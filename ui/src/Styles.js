import { color } from "framer-motion";

export const Colors = {
  text: "#161A30",
  textDisabled: "#B6BBC4",
  lines: "#161A30",
  disabled: "#89CFF3",
  enabled: "#A0E9FF",
  background: "#CDF5FD",
  backgroundDark: "#00A9FF",
  white: "#EEF5FF"
};

export const Styles = {
  main : {
    margin: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
  },
  input : {
    borderColor:Colors.lines,
    borderRadius: 20
  },
  panel: {
    width: '100%',
    borderWidth: '2px',
    backgroundColor: Colors.enabled,
    borderColor: Colors.lines,
    color: Colors.text,
    borderWidth:"0.2em",
    padding:"1em"
  },
  seperator: {
    backgroundColor: Colors.disabled,
    color: Colors.disabled,
    borderColor: Colors.disabled,
    borderWidth: "0.1em"
  },
  logoText: {
    color:Colors.text,
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
    width:"fit-content",
    overflowWrap: "break-word",
    fontSize:"0.9em",
    borderWidth:"0.1em",
    borderColor:"black"
  },
  buttonLogin: {
    size:"md",
    variant:"solid",
    fontSize:"1em",
    borderWidth:"0.1em",
    borderColor:"black"
  },
  buttonRefresh: {
    position:"absolute",
    right:"5%",
    top:"90%",
    width:"2.5em",
    height:"2.5em",
    borderRadius:"100%",
    size:"2em",
    borderWidth:"0.05em",
    borderColor:"black",
    zIndex:"9999"
  },
  itemList:{
    display:"flex",
    flexWrap:"wrap",
    alignItems:"center",
    gap:"0.3em"
  },
  item:{
    display:"flex",
    flexDirection:"column",
    width:"fit-content"
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

export default Styles;