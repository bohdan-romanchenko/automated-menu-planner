import { Box, Heading, Text, Button } from "@radix-ui/themes";
import { FileIcon } from "@radix-ui/react-icons";
import { type ReactNode, useRef } from "react";
import { GeistSans } from "geist/font/sans";

interface DayMenu {
  breakfast: string;
  snack1: string;
  lunch: string;
  snack2: string;
  dinner: string;
}

interface WeeklyMenu {
  monday: DayMenu;
  tuesday: DayMenu;
  wednesday: DayMenu;
  thursday: DayMenu;
  friday: DayMenu;
  saturday: DayMenu;
  sunday: DayMenu;
}

interface MenuDisplayProps {
  content: string;
}

// Order matters for display
const DISPLAY_MEAL_TYPES = [
  { key: "breakfast" as const, label: "Сніданок" },
  { key: "snack1" as const, label: "Перекус" },
  { key: "lunch" as const, label: "Обід" },
  { key: "snack2" as const, label: "Перекус" },
  { key: "dinner" as const, label: "Вечеря" },
];

// Order matters for display
const DISPLAY_DAYS = [
  { key: "monday" as const, label: "Понеділок" },
  { key: "tuesday" as const, label: "Вівторок" },
  { key: "wednesday" as const, label: "Середа" },
  { key: "thursday" as const, label: "Четвер" },
  { key: "friday" as const, label: "П'ятниця" },
  { key: "saturday" as const, label: "Субота" },
  { key: "sunday" as const, label: "Неділя" },
] as const;

const MEAL_TYPES = {
  breakfast: "Сніданок",
  snack1: "Перекус",
  lunch: "Обід",
  snack2: "Перекус",
  dinner: "Вечеря",
} as const;

const DAY_NAMES = {
  monday: "Понеділок",
  tuesday: "Вівторок",
  wednesday: "Середа",
  thursday: "Четвер",
  friday: "П'ятниця",
  saturday: "Субота",
  sunday: "Неділя",
} as const;

export function MenuDisplay({ content }: MenuDisplayProps): ReactNode {
  const printContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printContentRef.current;
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("");
        } catch {
          return "";
        }
      })
      .join("");

    iframeDoc.write(`
      <!DOCTYPE html>
      <html class="${GeistSans.variable}">
        <head>
          <style>
            ${styles}
            @page {
              size: landscape;
              margin: 1.5cm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: var(--font-geist-sans), system-ui, sans-serif;
            }
            .print-content {
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: var(--font-geist-sans), system-ui, sans-serif;
            }
            td, th {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
              font-family: var(--font-geist-sans), system-ui, sans-serif;
            }
            h1 {
              font-family: var(--font-geist-sans), system-ui, sans-serif;
              font-size: 1.5rem;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    iframeDoc.close();

    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 100);
  };

  let weeklyMenu: WeeklyMenu;
  try {
    const parsed = JSON.parse(content) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid menu format");
    }
    weeklyMenu = parsed as WeeklyMenu;
  } catch (err) {
    console.error("Failed to parse menu content:", err);
    return <Text className="text-red-500">Failed to parse menu content</Text>;
  }

  // Mobile view (list)
  const mobileView = (
    <div className="md:hidden">
      {DISPLAY_DAYS.map(({ key: day, label }) => (
        <Box key={day} className="mb-6 last:mb-0">
          <Heading size="4" mb="2" className="text-[#2B4C32]">
            {label}
          </Heading>
          <Box className="space-y-3">
            {DISPLAY_MEAL_TYPES.map(({ key: mealType, label: mealLabel }) => (
              <Box key={mealType} className="rounded-lg bg-gray-50 p-3">
                <Text
                  as="div"
                  size="2"
                  weight="medium"
                  className="text-[#2B4C32]"
                >
                  {mealLabel}
                </Text>
                <Text as="div" size="2" className="mt-1">
                  {weeklyMenu[day][mealType]}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </div>
  );

  const printableContent = (
    <div ref={printContentRef} className="print-content">
      <Heading size="6" className="mb-4 text-center">
        Weekly Menu
      </Heading>
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-200 pb-2 text-left text-sm font-medium">
              Час
            </th>
            {DISPLAY_DAYS.map(({ key, label }) => (
              <th
                key={key}
                className="border border-gray-200 pb-2 text-left text-sm font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DISPLAY_MEAL_TYPES.map(({ key: mealType, label: mealLabel }) => (
            <tr key={mealType} className="border-b border-gray-100">
              <td className="border border-gray-200 py-3 pr-4 text-sm font-medium">
                {mealLabel}
              </td>
              {DISPLAY_DAYS.map(({ key: day }) => (
                <td
                  key={day}
                  className="border border-gray-200 py-3 pr-4 text-sm"
                >
                  {weeklyMenu[day][mealType]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Box className="mt-4 rounded-lg border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-end">
        <Button
          onClick={handlePrint}
          className="inline-flex items-center bg-[#B7E33B] font-medium hover:bg-[#a5ce34]"
          style={{ cursor: "pointer" }}
        >
          <FileIcon className="mr-2" />
          Print Menu
        </Button>
      </div>
      {mobileView}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-gray-200 pb-2 text-left text-sm font-medium text-[#2B4C32]">
                Час
              </th>
              {DISPLAY_DAYS.map(({ key, label }) => (
                <th
                  key={key}
                  className="border-b border-gray-200 pb-2 text-left text-sm font-medium text-[#2B4C32]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISPLAY_MEAL_TYPES.map(({ key: mealType, label: mealLabel }) => (
              <tr
                key={mealType}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-3 pr-4 text-sm font-medium text-[#2B4C32]">
                  {mealLabel}
                </td>
                {DISPLAY_DAYS.map(({ key: day }) => (
                  <td key={day} className="py-3 pr-4 text-sm">
                    {weeklyMenu[day][mealType]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="hidden">{printableContent}</div>
    </Box>
  );
}
