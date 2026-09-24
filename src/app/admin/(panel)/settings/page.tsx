import type { Metadata } from "next";
import { BookingSettingsForm } from "@/components/admin/settings/BookingSettingsForm";
import { PasswordForm } from "@/components/admin/settings/PasswordForm";
import { RestaurantForm } from "@/components/admin/settings/RestaurantForm";
import { PageHeader } from "@/components/admin/ui";
import { readMedia } from "@/lib/data/media";
import { readBookingSettings, readRestaurant } from "@/lib/data/restaurant";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [settings, info, library] = await Promise.all([readBookingSettings(), readRestaurant(), readMedia(true)]);
  return (
    <>
      <PageHeader title="Settings" description="Restaurant details, hero copy, SEO, booking rules and your account." />
      <div className="space-y-8">
        <BookingSettingsForm settings={settings} />
        <RestaurantForm info={info} library={library.map((m) => ({ id: m.id, file: m.file, alt: m.alt, tag: m.tag }))} />
        <PasswordForm />
      </div>
    </>
  );
}
