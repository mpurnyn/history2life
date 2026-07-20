# History2Life Feature list
(c) Marat Purnyn 2026

## Core Features
- Speach 2 Speach models for voicing historical futures (personas)
- Persona definitions control a characters vocabulary and voice models
- Personas have fixed knowledge bases that define facts as they know them
- Users + Personas have a conversation tracker so the persona has context to remember their conversation with the Users
- Persona's have a character model that is animated by the backend speach generated
- New Personas can be made for any character with validation.
- questions are generated per character to provide users with something to ask.
- questions are suplanted by user interaction with the character based on what they have asked already.
- Personas have a allowed topic list and forbidden topic list which can be enabled to add some guardrails to the conversation
- Speach made by the user that is forbidden is ignored. Models will not react to it. Users will get a warning message.
- User conversations are trascribed for the user unless they opt-out
- User conversations are used for improving training data and metrics unmless they opt-out.

## Teacher Role Features
- Teachers roles can exist that have control of a class.
- Teachers can share the class with another teacher
- A class can never be left without a teacher
- students are users but they must have a class (s)
- teachers can read transcripts of conversation with students
- teachers can modify their allowed/forbidden topics.
- teachers can adjust persaon knowledge base
- teachers accounts pay a base rate + per token up to a max value (in dollars).
- teachers can set the max value (in dollars)
- teachers can set a per student allotment of tokens.
- teachers never have to worry about runaway token prices

## COPPA-Compliance features