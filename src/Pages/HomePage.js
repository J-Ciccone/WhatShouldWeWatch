import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Intro from "../Components/HomePageComponents/Intro";
import { getRandom } from "../Services/NumberService";

const HomePage = () => {
  useEffect(() => {
    localStorage.getItem("user") === null && 
    getRandom(10).then((userId)=>localStorage.setItem("user",userId ))
      
  }, []);

  return <Intro></Intro>;
};

export default HomePage;
