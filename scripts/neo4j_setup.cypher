// Kør i Neo4j Browser (http://localhost:7474) én gang før ingestion.
// Embedding-model: bge-m3 (Ollama) = 1024 dimensioner.

// Unikke id'er (forhindrer dubletter)
CREATE CONSTRAINT stykke_id IF NOT EXISTS FOR (s:Stykke) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT paragraf_nr IF NOT EXISTS FOR (p:Paragraf) REQUIRE p.nr IS UNIQUE;
CREATE CONSTRAINT kapitel_nr IF NOT EXISTS FOR (k:Kapitel) REQUIRE k.nr IS UNIQUE;

// Vektorindex på stykkernes embeddings
CREATE VECTOR INDEX stykke_embedding IF NOT EXISTS
FOR (s:Stykke) ON s.embedding
OPTIONS { indexConfig: {
  `vector.dimensions`: 1024,
  `vector.similarity_function`: 'cosine'
}};

// Tjek: SHOW INDEXES;
// Nulstil alt (hvis du vil starte forfra): MATCH (n) DETACH DELETE n;

// --- Graf (workflow 02) ---
CREATE CONSTRAINT lov_navn IF NOT EXISTS FOR (l:Lov) REQUIRE l.navn IS UNIQUE;
CREATE CONSTRAINT emne_navn IF NOT EXISTS FOR (e:Emne) REQUIRE e.navn IS UNIQUE;
CREATE CONSTRAINT part_navn IF NOT EXISTS FOR (p:Part) REQUIRE p.navn IS UNIQUE;
CREATE CONSTRAINT frist_id IF NOT EXISTS FOR (f:Frist) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT begreb_navn IF NOT EXISTS FOR (b:Begreb) REQUIRE b.navn IS UNIQUE;
