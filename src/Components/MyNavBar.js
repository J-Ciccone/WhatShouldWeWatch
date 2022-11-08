import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const MyNavBar = () => {
  return (
    <Navbar bg="light" className="mb-4 text-align-center" style={{borderRadius: "10px"}}>
        <Navbar.Brand  href="/home" ><div style={{height:"200px", width:"200px"}}><img style={{height:"100%", width:"100%"}}alt="alt" src="../assets/tempLogo.png"/></div></Navbar.Brand>
        
    </Navbar>
  );
};

export default MyNavBar;
