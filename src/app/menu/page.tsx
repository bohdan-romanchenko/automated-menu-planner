"use client";

import { useState, useEffect } from "react";
import { Box, Heading, Button, Flex, Text } from "@radix-ui/themes";
import { StarIcon } from "@radix-ui/react-icons";
import { Navigation } from "../../components/Navigation";
import { generateMenu } from "../actions";
import { getLatestMenu } from "../../lib/menus";

interface MenuContent {
  id: number;
  content: string;
  created_at: string;
}

export default function Menu() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadLatestMenu();
  }, []);

  const loadLatestMenu = async () => {
    try {
      const latestMenu = await getLatestMenu();
      if (latestMenu) {
        setMenu(latestMenu);
      }
    } catch (err) {
      setError("Failed to load menu");
      console.error("Error loading menu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const newMenu = await generateMenu();
      setMenu(newMenu);
    } catch (err) {
      setError("Failed to generate menu");
      console.error("Error generating menu:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-8 md:px-6">
      <Navigation />
      <div className="mt-4 w-full max-w-[400px]">
        <Box className="rounded-xl bg-white p-4 shadow-lg md:p-8">
          <Flex direction="column" gap="4">
            <Heading size="6" className="text-center">
              Weekly Menu
            </Heading>

            {error && <Text className="text-center text-red-500">{error}</Text>}

            <Button
              size="3"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
              className="bg-[#B7E33B] font-medium hover:bg-[#a5ce34]"
            >
              <StarIcon width="18" height="18" />
              {isGenerating ? "Generating..." : "Generate Menu"}
            </Button>

            {isLoading ? (
              <Text className="text-center text-gray-500">Loading...</Text>
            ) : menu ? (
              <Box className="mt-4 whitespace-pre-wrap rounded-lg border border-gray-200 p-4">
                {menu.content}
              </Box>
            ) : (
              <Text className="text-center text-gray-500">
                No menu generated yet. Click the button above to generate one!
              </Text>
            )}
          </Flex>
        </Box>
      </div>
    </div>
  );
}
