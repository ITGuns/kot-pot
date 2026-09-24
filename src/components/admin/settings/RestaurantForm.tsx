"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveRestaurantInfo } from "@/actions/settings";
import type { Media, RestaurantInfo } from "@/db/schema";
import { ImageUpload } from "@/components/admin/menu/ImageUpload";
import { useToast } from "@/components/admin/toast";
import { Btn, Card, Field, Input, Textarea } from "@/components/admin/ui";

export function RestaurantForm({ info, library }: { info: RestaurantInfo; library: Pick<Media, "id" | "file" | "alt" | "tag">[] }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({
    name: info.name, tagline: info.tagline, category: info.category, description: info.description,
    addressLine1: info.addressLine1, addressLine2: info.addressLine2 ?? "", city: info.city, state: info.state, zip: info.zip, phone: info.phone, email: info.email ?? "",
    website: info.website ?? "", instagramUrl: info.instagramUrl ?? "", facebookUrl: info.facebookUrl ?? "", tiktokUrl: info.tiktokUrl ?? "", yelpUrl: info.yelpUrl ?? "", googleMapsUrl: info.googleMapsUrl ?? "",
    rating: info.rating ?? "", reviewCount: info.reviewCount == null ? "" : String(info.reviewCount), priceRange: info.priceRange ?? "", serviceTypes: info.serviceTypes.join("\n"),
    heroImage: info.heroImage ?? "", heroImageAlt: info.heroImageAlt ?? "", heroHeadline: info.heroHeadline ?? "", heroSubheadline: info.heroSubheadline ?? "", ayceBlurb: info.ayceBlurb ?? "",
    seoTitle: info.seoTitle ?? "", seoDescription: info.seoDescription ?? "", ogImageUrl: info.ogImageUrl ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const t = (k: keyof typeof f) => ({ id: `r-${k}`, value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }), error: !!errors[k] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await saveRestaurantInfo({ ...f, serviceTypes: f.serviceTypes.split("\n").map((x) => x.trim()).filter(Boolean) });
    setBusy(false);
    if (res.ok) {
      toast.success("Restaurant info saved");
      router.refresh();
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card title="Restaurant information" description="Used across the website, footer, structured data and the booking confirmation." actions={<Btn type="submit" variant="primary" loading={busy}>Save info</Btn>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="r-name" error={errors.name} required><Input {...t("name")} required /></Field>
          <Field label="Category" htmlFor="r-category" error={errors.category} hint="e.g. Korean BBQ & Hot Pot"><Input {...t("category")} /></Field>
          <Field label="Tagline" htmlFor="r-tagline" error={errors.tagline} className="sm:col-span-2" required hint="Separate parts with · (shown in the hero, footer and intro)"><Input {...t("tagline")} required /></Field>
          <Field label="Description" htmlFor="r-description" error={errors.description} className="sm:col-span-2"><Textarea {...t("description")} /></Field>
          <Field label="Address" htmlFor="r-addressLine1" error={errors.addressLine1} required><Input {...t("addressLine1")} required /></Field>
          <Field label="Address line 2" htmlFor="r-addressLine2" error={errors.addressLine2}><Input {...t("addressLine2")} /></Field>
          <Field label="City" htmlFor="r-city" error={errors.city} required><Input {...t("city")} required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State" htmlFor="r-state" error={errors.state} required><Input {...t("state")} required /></Field>
            <Field label="ZIP" htmlFor="r-zip" error={errors.zip} required><Input {...t("zip")} required /></Field>
          </div>
          <Field label="Phone" htmlFor="r-phone" error={errors.phone} required><Input {...t("phone")} required /></Field>
          <Field label="Email" htmlFor="r-email" error={errors.email} hint="Optional; shown in the footer when set"><Input type="email" {...t("email")} /></Field>
          <Field label="Rating" htmlFor="r-rating" error={errors.rating} hint="0–5, e.g. 4.5"><Input {...t("rating")} inputMode="decimal" /></Field>
          <Field label="Review count" htmlFor="r-reviewCount" error={errors.reviewCount}><Input {...t("reviewCount")} inputMode="numeric" /></Field>
          <Field label="Price range" htmlFor="r-priceRange" error={errors.priceRange} hint="e.g. $30–40 per person"><Input {...t("priceRange")} /></Field>
          <Field label="Service types (one per line)" htmlFor="r-serviceTypes" error={errors.serviceTypes}><Textarea {...t("serviceTypes")} /></Field>
        </div>
      </Card>

      <Card title="Homepage hero & featured copy" description="The big headline on the homepage. The official tagline above is always shown too.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hero headline" htmlFor="r-heroHeadline" error={errors.heroHeadline} className="sm:col-span-2" hint="Sentences become separate lines; the last one is highlighted"><Input {...t("heroHeadline")} /></Field>
          <Field label="Hero subheadline" htmlFor="r-heroSubheadline" error={errors.heroSubheadline} className="sm:col-span-2"><Input {...t("heroSubheadline")} /></Field>
          <Field label="Hero photo" className="sm:col-span-2"><ImageUpload value={f.heroImage} onChange={(v) => setF({ ...f, heroImage: v })} library={library} altSuggestion="Hero photo" /></Field>
          <Field label="Hero photo alt text" htmlFor="r-heroImageAlt" error={errors.heroImageAlt} className="sm:col-span-2"><Input {...t("heroImageAlt")} /></Field>
          <Field label="All-you-can-eat blurb" htmlFor="r-ayceBlurb" error={errors.ayceBlurb} className="sm:col-span-2"><Textarea {...t("ayceBlurb")} /></Field>
        </div>
      </Card>

      <Card title="SEO" description="Page title, description and share image for search engines and social previews.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Homepage title" htmlFor="r-seoTitle" error={errors.seoTitle} className="sm:col-span-2"><Input {...t("seoTitle")} /></Field>
          <Field label="Meta description" htmlFor="r-seoDescription" error={errors.seoDescription} className="sm:col-span-2"><Textarea {...t("seoDescription")} /></Field>
          <Field label="Share image (Open Graph)" className="sm:col-span-2"><ImageUpload value={f.ogImageUrl} onChange={(v) => setF({ ...f, ogImageUrl: v })} library={library} altSuggestion="Share image" /></Field>
        </div>
      </Card>

      <Card title="Links" description="Social profiles and listings. Leave blank to hide.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website" htmlFor="r-website" error={errors.website}><Input {...t("website")} placeholder="https://" /></Field>
          <Field label="Google Maps link" htmlFor="r-googleMapsUrl" error={errors.googleMapsUrl} hint="Optional; otherwise the address is used"><Input {...t("googleMapsUrl")} placeholder="https://" /></Field>
          <Field label="Instagram" htmlFor="r-instagramUrl" error={errors.instagramUrl}><Input {...t("instagramUrl")} placeholder="https://" /></Field>
          <Field label="Facebook" htmlFor="r-facebookUrl" error={errors.facebookUrl}><Input {...t("facebookUrl")} placeholder="https://" /></Field>
          <Field label="TikTok" htmlFor="r-tiktokUrl" error={errors.tiktokUrl}><Input {...t("tiktokUrl")} placeholder="https://" /></Field>
          <Field label="Yelp" htmlFor="r-yelpUrl" error={errors.yelpUrl}><Input {...t("yelpUrl")} placeholder="https://" /></Field>
        </div>
      </Card>
    </form>
  );
}
