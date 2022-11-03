import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const MyNavBar = () => {
  return (
    <Navbar bg="light" className="mb-4">
      <Container >
        <Navbar.Brand  href="/home" style={{fontSize:"2rem"}}>MyMoviePicker</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/random">Random</Nav.Link>
          <Nav.Link href="/lists">Lists</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavBar;
