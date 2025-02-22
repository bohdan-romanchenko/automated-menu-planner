import { Tabs } from "@radix-ui/themes";
import { useRouter, usePathname } from "next/navigation";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs.Root value={pathname} className="w-full max-w-[400px]">
      <Tabs.List>
        <Tabs.Trigger
          value="/"
          onClick={() => router.push("/")}
          className="flex-1"
        >
          Inventory
        </Tabs.Trigger>
        <Tabs.Trigger
          value="/menu"
          onClick={() => router.push("/menu")}
          className="flex-1"
        >
          Menu
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
