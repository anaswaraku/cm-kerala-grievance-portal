import { useEffect, useState } from "react";
import { getDepartments } from "../services/api";
import healthImage from "../assets/departments/health.png";
import AdministrationImage from "../assets/departments/administrativereforms.png";
import AgricultureImage from "../assets/departments/agriculture.png";
import AnimalHusbandryImage from "../assets/departments/animalhusbandry.jpg";
import ArchaeologyImage from "../assets/departments/archaeology.jpg";
import AyushImage from "../assets/departments/ayush.jpg";
import BackwardClassesImage from "../assets/departments/backwardclass.jpg";
import CoastalShippingImage from "../assets/departments/coastalshipping.jpg";
import ConsumerAffairsImage from "../assets/departments/coastalshipping.jpg";
import CooperationImage from "../assets/departments/cooperation.jpg";
import CulturalAffairsImage from "../assets/departments/cultural.jpg";
import DisasterManagementImage from "../assets/departments/disastermngmnt.jpg";
import ElectionImage from "../assets/departments/election.jpg";
import ElectronicsAndInformationTechnologyImage from "../assets/departments/it.jpg";
import EnvironmentImage from "../assets/departments/environment.jpg";
import ExciseImage from "../assets/departments/excise.avif";
import FinanceImage from "../assets/departments/finance.jpg";
import FisheriesImage from "../assets/departments/fish.jpg";
import FoodAndCivilSuppliesImage from "../assets/departments/food.jpg";
import ForestAndWildlifeImage from "../assets/departments/forest.jpg";
import GeneralAdministrationImage from "../assets/departments/generaled.jpg";
import GeneralEducationImage from "../assets/departments/disastermngmnt.jpg";
import HigherEducationImage from "../assets/departments/highered.jpg";
import HomeImage from "../assets/departments/health.png";
import "../styles/DepartmentsPage.css";

const departmentImages = {
  health: healthImage,
  administration: AdministrationImage,
  "administrative reforms": AdministrationImage,
  agriculture: AgricultureImage,
  "animal husbandry": AnimalHusbandryImage,
  archaeology: ArchaeologyImage,
  ayush: AyushImage,
  "backward classes": BackwardClassesImage,
  "coastal shipping": CoastalShippingImage,
  "consumer affairs": ConsumerAffairsImage,
  "co-operation": CooperationImage,
  "cultural affairs": CulturalAffairsImage,
  "disaster management": DisasterManagementImage,
  election: ElectionImage,
  "electronics and information technology":
    ElectronicsAndInformationTechnologyImage,
  environment: EnvironmentImage,
  excise: ExciseImage,
  finance: FinanceImage,
  fisheries: FisheriesImage,
  "food and civil supplies": FoodAndCivilSuppliesImage,
  "forest and wildlife": ForestAndWildlifeImage,
  "general administration": GeneralAdministrationImage,
  "general education": GeneralEducationImage,
  "health and family welfare": healthImage,
  "higher education": HigherEducationImage,
  home: HomeImage,
};

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

  if (loading)
    return <p className="department-message">Loading departments...</p>;

  if (error) return <p className="department-error">{error}</p>;

  return (
    <main className="departments-page">
      <header className="departments-header">
        <p className="departments-eyebrow">Public grievance redressal</p>

        <h1>Government Departments</h1>

        <p>
          Explore government departments responsible for addressing public
          grievances and providing citizen services.
        </p>
      </header>

      {departments.length === 0 ? (
        <p className="department-message">No departments available.</p>
      ) : (
        <section className="departments-grid">
          {departments.map((department) => {
            const key = department.name.toLowerCase();

            const image =
              department.image_url ||
              Object.entries(departmentImages)
                .sort(([first], [second]) => second.length - first.length)
                .find(([name]) => key.includes(name))?.[1] ||
              "/departments/default.jpg";

            return (
              <article className="department-card" key={department.id}>
                <img
                  className="department-card-image"
                  src={image}
                  alt=""
                  loading="lazy"
                />

                <div className="department-overlay"></div>

                <div className="department-card-content">
                  <h2>{department.name}</h2>

                  <p>{department.description}</p>

                  <span className="department-explore">
                    Explore Department →
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
