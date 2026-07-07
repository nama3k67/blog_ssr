import enlabLogo from "~/shared/images/logos/Enlabsoftware Logo.jpg";
import fptuLogo from "~/shared/images/logos/FPTU Logo.png";
import techvifyLogo from "~/shared/images/logos/Techvify Logo.png";

export interface Role {
	company: string;
	title: { en: string; vi: string };
	start: string;
	end: string;
	url?: string;
	// ponytail: optional — Resume falls back to an initials circle when absent.
	logo?: string;
}

// Placeholder work history — replace companies/roles/dates (and add logos) as needed.
export const RESUME: Role[] = [
	{
		company: "Techvify",
		title: { en: "Software Engineer", vi: "Kỹ sư Phần mềm" },
		start: "2025",
		end: "Present",
		url: "https://techvify.com",
		logo: techvifyLogo,
	},
	{
		company: "Enlab Software",
		title: { en: "Software Engineer", vi: "Kỹ sư Phần mềm" },
		start: "2022",
		end: "2025",
		url: "https://enlabsoftware.com",
		logo: enlabLogo,
	},
	{
		company: "FPT University",
		title: { en: "Student", vi: "Sinh viên" },
		start: "2018",
		end: "2022",
		url: "https://fpt.edu.vn",
		logo: fptuLogo,
	},
];
