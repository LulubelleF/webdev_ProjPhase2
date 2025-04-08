const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting employee database seeding...");

  // Clear existing employees (optional - use with caution in production)
  // await prisma.employee.deleteMany({})
  // console.log("Cleared existing employees")

  // Character names from animated shows
  const characters = [
    // SpongeBob SquarePants
    { firstName: "SpongeBob", lastName: "SquarePants" },
    { firstName: "Patrick", lastName: "Star" },
    { firstName: "Squidward", lastName: "Tentacles" },
    { firstName: "Sandy", lastName: "Cheeks" },
    { firstName: "Eugene", lastName: "Krabs" },
    { firstName: "Sheldon", lastName: "Plankton" },
    { firstName: "Gary", lastName: "Snail" },
    { firstName: "Pearl", lastName: "Krabs" },
    { firstName: "Mrs.", lastName: "Puff" },
    { firstName: "Larry", lastName: "Lobster" },

    // Powerpuff Girls
    { firstName: "Blossom", lastName: "Utonium" },
    { firstName: "Bubbles", lastName: "Utonium" },
    { firstName: "Buttercup", lastName: "Utonium" },
    { firstName: "Professor", lastName: "Utonium" },
    { firstName: "Mojo", lastName: "Jojo" },
    { firstName: "Him", lastName: "Demon" },
    { firstName: "Princess", lastName: "Morbucks" },
    { firstName: "Sedusa", lastName: "Medusa" },
    { firstName: "Mayor", lastName: "Bellum" },
    { firstName: "Ms.", lastName: "Keane" },

    // Avatar: The Last Airbender
    { firstName: "Aang", lastName: "Airbender" },
    { firstName: "Katara", lastName: "Waterbender" },
    { firstName: "Sokka", lastName: "Warrior" },
    { firstName: "Toph", lastName: "Beifong" },
    { firstName: "Zuko", lastName: "Firelord" },
    { firstName: "Iroh", lastName: "Dragon" },
    { firstName: "Azula", lastName: "Princess" },
    { firstName: "Mai", lastName: "Blade" },
    { firstName: "Ty", lastName: "Lee" },
    { firstName: "Suki", lastName: "Kyoshi" },

    // Adventure Time
    { firstName: "Finn", lastName: "Human" },
    { firstName: "Jake", lastName: "Dog" },
    { firstName: "Princess", lastName: "Bubblegum" },
    { firstName: "Marceline", lastName: "Vampire" },
    { firstName: "Ice", lastName: "King" },
    { firstName: "BMO", lastName: "Robot" },
    { firstName: "Lumpy", lastName: "Space Princess" },
    { firstName: "Flame", lastName: "Princess" },
    { firstName: "Lady", lastName: "Rainicorn" },
    { firstName: "Peppermint", lastName: "Butler" },

    // Rick and Morty
    { firstName: "Rick", lastName: "Sanchez" },
    { firstName: "Morty", lastName: "Smith" },
    { firstName: "Summer", lastName: "Smith" },
    { firstName: "Beth", lastName: "Smith" },
    { firstName: "Jerry", lastName: "Smith" },
    { firstName: "Mr.", lastName: "Meeseeks" },
    { firstName: "Bird", lastName: "Person" },
    { firstName: "Evil", lastName: "Morty" },
    { firstName: "Mr.", lastName: "Poopybutthole" },
    { firstName: "Squanchy", lastName: "Cat" },

    // Gravity Falls
    { firstName: "Dipper", lastName: "Pines" },
    { firstName: "Mabel", lastName: "Pines" },
    { firstName: "Stanley", lastName: "Pines" },
    { firstName: "Stanford", lastName: "Pines" },
    { firstName: "Soos", lastName: "Ramirez" },
    { firstName: "Wendy", lastName: "Corduroy" },
    { firstName: "Gideon", lastName: "Gleeful" },
    { firstName: "Bill", lastName: "Cipher" },
    { firstName: "Pacifica", lastName: "Northwest" },
    { firstName: "Robbie", lastName: "Valentino" },

    // Steven Universe
    { firstName: "Steven", lastName: "Universe" },
    { firstName: "Garnet", lastName: "Gem" },
    { firstName: "Amethyst", lastName: "Gem" },
    { firstName: "Pearl", lastName: "Gem" },
    { firstName: "Peridot", lastName: "Gem" },
    { firstName: "Lapis", lastName: "Lazuli" },
    { firstName: "Connie", lastName: "Maheswaran" },
    { firstName: "Greg", lastName: "Universe" },
    { firstName: "Yellow", lastName: "Diamond" },
    { firstName: "Blue", lastName: "Diamond" },

    // Regular Show
    { firstName: "Mordecai", lastName: "Bluejay" },
    { firstName: "Rigby", lastName: "Raccoon" },
    { firstName: "Benson", lastName: "Gumball" },
    { firstName: "Pops", lastName: "Maellard" },
    { firstName: "Skips", lastName: "Yeti" },
    { firstName: "Muscle", lastName: "Man" },
    { firstName: "Hi-Five", lastName: "Ghost" },
    { firstName: "Margaret", lastName: "Robin" },
    { firstName: "Eileen", lastName: "Mole" },
    { firstName: "CJ", lastName: "Cloud" },

    // The Simpsons
    { firstName: "Homer", lastName: "Simpson" },
    { firstName: "Marge", lastName: "Simpson" },
    { firstName: "Bart", lastName: "Simpson" },
    { firstName: "Lisa", lastName: "Simpson" },
    { firstName: "Maggie", lastName: "Simpson" },
    { firstName: "Ned", lastName: "Flanders" },
    { firstName: "Montgomery", lastName: "Burns" },
    { firstName: "Waylon", lastName: "Smithers" },
    { firstName: "Moe", lastName: "Szyslak" },
    { firstName: "Krusty", lastName: "Clown" },
  ];

  // Departments
  const departments = [
    "Engineering",
    "Marketing",
    "HR",
    "Finance",
    "Sales",
    "Operations",
    "Customer Support",
    "Research",
    "Product",
    "Legal",
  ];

  // Job titles by department
  const jobTitlesByDepartment = {
    Engineering: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "DevOps Engineer",
      "QA Engineer",
      "Engineering Manager",
      "CTO",
      "Technical Lead",
    ],
    Marketing: [
      "Marketing Specialist",
      "Content Writer",
      "SEO Specialist",
      "Social Media Manager",
      "Marketing Director",
      "Brand Manager",
      "Marketing Analyst",
    ],
    HR: [
      "HR Specialist",
      "Recruiter",
      "HR Manager",
      "Talent Acquisition",
      "HR Director",
      "Training Coordinator",
      "Benefits Administrator",
    ],
    Finance: [
      "Accountant",
      "Financial Analyst",
      "Controller",
      "CFO",
      "Bookkeeper",
      "Payroll Specialist",
      "Finance Manager",
    ],
    Sales: [
      "Sales Representative",
      "Account Executive",
      "Sales Manager",
      "Business Development",
      "Sales Director",
      "Account Manager",
    ],
    Operations: [
      "Operations Manager",
      "Project Manager",
      "Business Analyst",
      "Operations Director",
      "Logistics Coordinator",
      "Facilities Manager",
    ],
    "Customer Support": [
      "Customer Support Representative",
      "Support Manager",
      "Technical Support",
      "Customer Success Manager",
      "Support Team Lead",
    ],
    Research: [
      "Research Scientist",
      "Data Analyst",
      "Research Director",
      "Lab Technician",
      "Research Assistant",
      "Data Scientist",
    ],
    Product: [
      "Product Manager",
      "Product Owner",
      "UX Designer",
      "UI Designer",
      "Product Director",
      "Product Analyst",
    ],
    Legal: [
      "Legal Counsel",
      "Paralegal",
      "Compliance Officer",
      "Legal Assistant",
      "General Counsel",
      "Contract Specialist",
    ],
  };

  // Employment types
  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Intern",
  ];

  // Employment statuses
  const employmentStatuses = ["Active", "On Leave", "Terminated"];

  // Work locations
  const workLocations = [
    "Headquarters",
    "Remote",
    "Branch Office",
    "Satellite Office",
    "Home Office",
  ];

  // Countries
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "India",
    "Brazil",
    "Mexico",
  ];

  // States (for US)
  const states = ["CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"];

  // Cities by state
  const citiesByState = {
    CA: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"],
    NY: ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany"],
    TX: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
    FL: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"],
    IL: ["Chicago", "Springfield", "Peoria", "Rockford", "Champaign"],
    PA: ["Philadelphia", "Pittsburgh", "Harrisburg", "Allentown", "Erie"],
    OH: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
    GA: ["Atlanta", "Savannah", "Augusta", "Macon", "Athens"],
    NC: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
    MI: ["Detroit", "Grand Rapids", "Lansing", "Ann Arbor", "Flint"],
  };

  // Emergency relationships
  const emergencyRelationships = [
    "Spouse",
    "Parent",
    "Sibling",
    "Friend",
    "Child",
    "Partner",
  ];

  // Create employees
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];

    // Generate random data for this employee
    const department =
      departments[Math.floor(Math.random() * departments.length)];
    const jobTitles = jobTitlesByDepartment[department];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const employmentType =
      employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
    const employmentStatus =
      employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)];
    const workLocation =
      workLocations[Math.floor(Math.random() * workLocations.length)];

    // Generate random dates
    const today = new Date();
    const pastDate = new Date();
    pastDate.setFullYear(
      today.getFullYear() - Math.floor(Math.random() * 40) - 20
    ); // 20-60 years ago
    const dateOfBirth = new Date(pastDate);

    const hireDate = new Date();
    hireDate.setFullYear(today.getFullYear() - Math.floor(Math.random() * 5)); // 0-5 years ago
    hireDate.setMonth(Math.floor(Math.random() * 12)); // Random month
    hireDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day (1-28 to avoid month issues)

    // Generate random salary between 40,000 and 150,000
    const currentSalary = Math.floor(Math.random() * 110000) + 40000;

    // Generate random address
    const state = states[Math.floor(Math.random() * states.length)];
    const cities = citiesByState[state];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = `${Math.floor(Math.random() * 9999) + 1} ${
      character.lastName
    } St`;
    const postalCode = `${Math.floor(Math.random() * 90000) + 10000}`;
    const country = "United States";

    // Generate random contact info
    const email = `${character.firstName.toLowerCase()}.${character.lastName.toLowerCase()}@humane.com`;
    const phoneNumber = `(${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;
    const workEmail = `${character.firstName.toLowerCase()}.${character.lastName.toLowerCase()}@work.humane.com`;
    const workPhone = `(${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    // Generate emergency contact
    const emergencyName = `Emergency ${character.lastName}`;
    const emergencyRelationship =
      emergencyRelationships[
        Math.floor(Math.random() * emergencyRelationships.length)
      ];
    const emergencyPhoneNumber = `(${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    // Generate reporting manager (just use a random employee ID for now)
    const reportingManagerId = `EMP${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        employeeId: `EMP${1000 + i}`,
        firstName: character.firstName,
        lastName: character.lastName,
        email: email,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,

        // Address
        street: street,
        city: city,
        state: state,
        postalCode: postalCode,
        country: country,

        // Emergency contact
        emergencyName: emergencyName,
        emergencyRelationship: emergencyRelationship,
        emergencyPhoneNumber: emergencyPhoneNumber,

        // Employment Info
        department: department,
        jobTitle: jobTitle,
        employmentType: employmentType,
        hireDate: hireDate,
        currentSalary: currentSalary,
        reportingManagerId: reportingManagerId,
        workLocation: workLocation,
        workEmail: workEmail,
        workPhone: workPhone,
        employmentStatus: employmentStatus,

        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
      },
    });

    console.log(
      `Created employee: ${character.firstName} ${character.lastName}`
    );
  }

  console.log(`Successfully seeded ${characters.length} employees!`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
