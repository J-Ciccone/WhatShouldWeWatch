import { Button, Col, Form, Image, Row, Container } from "react-bootstrap";
import "./Intro.css";

//TODO Add new screens to set rules for the new room, or just join a room if it is able to be joined
const Intro = () => {
  return (
    <>
        <div className="intro-text g-card ">
          <h1 className="m-2">
            What Should We Watch?
          </h1>
          <div className="m-2">
            Hanging with friends and just can't decide what to pick for movie
            night?
          </div>
          <h4 className="m-2">
            It gets frustrating trying to pick a movie
          </h4>
        </div>
    </>
  );
};

export default Intro;
