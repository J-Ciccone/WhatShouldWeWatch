import { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import Intro from "../Components/HomePageComponents/Intro";
import GetStarted from "../Components/HomePageComponents/GetStarted";
import { getRandom } from "../Services/NumberService";

const HomePage = () => {
  useEffect(() => {
    localStorage.getItem("user") === null &&
      localStorage.setItem("user", getRandom(10));
  }, []);

  return (
    <>
      <Container
        className="intro"
        fluid
        style={{ backgroundColor: "white", borderRadius: "5px" }}
      >
        <Intro></Intro>
      </Container>
      <GetStarted></GetStarted>
    </>
  );
};

export default HomePage;
