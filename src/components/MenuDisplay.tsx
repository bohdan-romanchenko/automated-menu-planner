import {
  Box,
  Heading,
  Text,
  Button,
  Dialog,
  TextField,
} from "@radix-ui/themes";
import { FileIcon, Pencil1Icon } from "@radix-ui/react-icons";
import {
  type ReactNode,
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
} from "react";
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
  onContentChange?: (updatedContent: string) => void;
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

type DayKey = keyof typeof DAY_NAMES;
type MealTypeKey = keyof typeof MEAL_TYPES;

export function MenuDisplay({
  content,
  onContentChange,
}: MenuDisplayProps): ReactNode {
  const printContentRef = useRef<HTMLDivElement>(null);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  const [editingMeal, setEditingMeal] = useState<{
    day: DayKey;
    mealType: MealTypeKey;
  } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePrint = () => {
    // Simply call window.print() to trigger the native print dialog
    // The print-only content is already in the DOM with print CSS applied
    window.print();
  };

  // Replace useState with useEffect for initial parsing of menu content
  useEffect(() => {
    try {
      const parsed = JSON.parse(content) as unknown;
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid menu format");
      }
      setWeeklyMenu(parsed as WeeklyMenu);
    } catch (err) {
      console.error("Failed to parse menu content:", err);
    }
  }, [content]);

  if (!weeklyMenu) {
    return <Text className="text-red-500">Failed to parse menu content</Text>;
  }

  const handleEditClick = (day: DayKey, mealType: MealTypeKey) => {
    setEditingMeal({ day, mealType });
    setEditContent(weeklyMenu[day][mealType]);
    setDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingMeal) {
      console.error("No meal currently being edited");
      return;
    }

    const { day, mealType } = editingMeal;
    const updatedMenu = JSON.parse(JSON.stringify(weeklyMenu)) as WeeklyMenu;
    updatedMenu[day][mealType] = editContent;

    // Set the updated menu in local state
    setWeeklyMenu(updatedMenu);

    // If onContentChange is provided, call it and close the dialog
    if (onContentChange) {
      try {
        const updatedContent = JSON.stringify(updatedMenu);
        console.log(`Updating menu content for ${day} ${mealType}`);
        onContentChange(updatedContent);
        setDialogOpen(false);
      } catch (error) {
        console.error("Failed to save menu changes:", error);
        // Keep dialog open if there was an error
      }
    } else {
      console.warn(
        "onContentChange prop is not provided - changes will only be visible until page refresh",
      );
      // Still close dialog even without onContentChange, but changes won't persist
      setDialogOpen(false);
    }
  };

  // Mobile view (list) with edit functionality
  const mobileView = (
    <div className="md:hidden print:hidden">
      {DISPLAY_DAYS.map(({ key: day, label }) => (
        <Box key={day} className="mb-6 last:mb-0">
          <Heading size="4" mb="2" className="text-[#2B4C32]">
            {label}
          </Heading>
          <Box className="space-y-3">
            {DISPLAY_MEAL_TYPES.map(({ key: mealType, label: mealLabel }) => (
              <Box
                key={mealType}
                className="cursor-pointer rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                onClick={() => handleEditClick(day, mealType)}
              >
                <div className="flex items-center justify-between">
                  <Text
                    as="div"
                    size="2"
                    weight="medium"
                    className="text-[#2B4C32]"
                  >
                    {mealLabel}
                  </Text>
                </div>
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

  // Print version (always a table, hidden except when printing)
  const printVersion = (
    <div className="hidden print:block">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          /* Make sure everything has white background */
          * {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: system-ui, -apple-system, sans-serif;
            background-color: white !important;
          }
          /* Hide all borders and padding from containers */
          .mt-4, .p-4, .border, .border-gray-200, .rounded-lg {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background-color: white !important;
          }
          /* Print container */
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
          }
          /* No header - we'll create the table directly */
          .print-header {
            display: none !important;
          }
          /* Set table to fit page width */
          table.print-table {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            table-layout: fixed;
            border: 1.5px solid black;
            border-collapse: collapse;
            page-break-inside: avoid;
            background-color: white !important;
          }
          /* Make headers and cells properly visible */
          table.print-table th, 
          table.print-table td {
            border: 1px solid black;
            padding: 0.2cm;
            vertical-align: top;
            font-size: 10pt;
            line-height: 1.3;
            overflow-wrap: break-word;
            word-wrap: break-word;
            text-align: left;
            background-color: white !important;
          }
          /* Make header row strong */
          table.print-table thead th {
            font-weight: bold;
            background-color: white !important;
            font-size: 11pt;
          }
          /* First column is day header column - time column */
          table.print-table th:first-child {
            width: 10%;
            background-color: white !important;
          }
          /* Meal type column styling */
          table.print-table td:first-child {
            font-weight: bold;
            background-color: white !important;
          }
          /* Day columns should be equal width */
          table.print-table th:not(:first-child),
          table.print-table td:not(:first-child) {
            width: calc(90% / 7); /* Distribute remaining 90% equally among 7 days */
            background-color: white !important;
          }
        }
      `,
        }}
      />
      <div className="print-container">
        {/* Removed header div to eliminate duplicate headers */}
        <table className="print-table">
          <thead>
            <tr>
              <th>Час</th>
              {DISPLAY_DAYS.map(({ key, label }) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISPLAY_MEAL_TYPES.map(({ key: mealType, label: mealLabel }) => (
              <tr key={mealType}>
                <td>{mealLabel}</td>
                {DISPLAY_DAYS.map(({ key: day }) => (
                  <td key={day}>{weeklyMenu[day][mealType]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Box className="mt-4 rounded-lg border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-end print:hidden">
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
      <div className="hidden overflow-x-auto md:block print:hidden">
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
                  <td
                    key={day}
                    className="cursor-pointer py-3 pr-4 text-sm transition-colors hover:bg-gray-50"
                    onClick={() => handleEditClick(day, mealType)}
                  >
                    {weeklyMenu[day][mealType]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {printVersion}

      {/* Edit Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>
            {editingMeal
              ? `Edit ${MEAL_TYPES[editingMeal.mealType]} for ${DAY_NAMES[editingMeal.day]}`
              : "Edit Meal"}
          </Dialog.Title>

          <div className="mt-4">
            <textarea
              placeholder="Enter meal details"
              value={editContent}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setEditContent(e.target.value)
              }
              rows={5}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#B7E33B] hover:bg-[#a5ce34]"
            >
              Save Changes
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
