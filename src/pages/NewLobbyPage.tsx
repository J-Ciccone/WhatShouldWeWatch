import { useState, type FormEvent } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUid } from "../auth/AuthContext";
import { MOVIES_PER_PERSON_OPTIONS } from "../lib/types";
import { createLobby } from "../services/lobby";

export function NewLobbyPage() {
  const uid = useUid();
  const navigate = useNavigate();
  const [numMovies, setNumMovies] = useState<number>(2);
  const [unlimitedVotes, setUnlimitedVotes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const code = await createLobby(uid, { numMovies, unlimitedVotes });
      navigate(`/lobby/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the lobby.");
      setCreating(false);
    }
  };

  return (
    <div className="page-center">
      <Form className="panel setup-form" onSubmit={start}>
        <h2>Let's Get Started</h2>
        <Form.Group className="mt-3" controlId="num-movies">
          <Form.Label>Movies each person picks</Form.Label>
          <Form.Select value={numMovies} onChange={(e) => setNumMovies(Number(e.target.value))}>
            {MOVIES_PER_PERSON_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Check
          className="mt-3"
          type="switch"
          id="unlimited-votes"
          label="Let people vote for more than one movie"
          checked={unlimitedVotes}
          onChange={(e) => setUnlimitedVotes(e.target.checked)}
        />
        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}
        <div className="mt-4">
          {creating ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Creating lobby…</span>
            </Spinner>
          ) : (
            <Button type="submit">Start Vote</Button>
          )}
        </div>
      </Form>
    </div>
  );
}
