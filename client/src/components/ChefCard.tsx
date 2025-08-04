import { Star, Cake, UserCog } from "lucide-react";

type Chef = {
  _id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  birthYear: number;
  about?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function ChefCard({ chef }: { chef: Chef }) {
  return (
    <div className="flex flex-col items-center text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Avatar initials circle */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-300 to-purple-500 dark:from-purple-800 dark:to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
        {getInitials(chef.name)}
      </div>

      {/* Name */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {chef.name}
      </h3>

      {/* Specialty */}
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        <UserCog className="inline-block w-4 h-4 mr-1 mb-0.5" />
        {chef.specialty}
      </p>

      {/* Meta: experience and birth */}
      <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
        <span>
          <Star className="inline-block w-4 h-4 mr-1 mb-0.5 text-yellow-500" />
          {chef.experienceYears} years of experience
        </span>
        <span>
          <Cake className="inline-block w-4 h-4 mr-1 mb-0.5 text-pink-400" />
          Born in {chef.birthYear}
        </span>
      </div>

      {/* About text */}
      {chef.about && (
        <p className="mt-4 text-sm italic text-gray-700 dark:text-gray-300">
          {chef.about}
        </p>
      )}
    </div>
  );
}
