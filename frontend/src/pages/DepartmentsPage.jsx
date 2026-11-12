import { useEffect, useState } from "react";
import { getDepartments } from "../services/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDepartments()
      .then((data) => setDepartments(data.departments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading departments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1>Government Departments</h1>

      {departments.map((department) => (
        <article key={department.id}>
          <h2>{department.name}</h2>
          <p>{department.description}</p>
        </article>
      ))}
    </main>
  );
}
