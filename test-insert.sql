SET request.jwt.claim.sub = 'b1cc4030-f22a-4d1c-b1fa-4cc94890e372';
SET ROLE authenticated;
INSERT INTO derivations (user_id, title) VALUES ('b1cc4030-f22a-4d1c-b1fa-4cc94890e372', 'Test Derivation');
SELECT * FROM derivations;
