export type Weapon = {
  slug: string;
  name: string;
  image: string;
  category: string;
};

export async function getWeapons(): Promise<Weapon[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" }
  );

  const skins = await res.json();

  const map = new Map<string, Weapon>();

  skins.forEach((skin: any) => {
    const weapon = skin.weapon;
    if (!weapon?.id) return;

    if (!map.has(weapon.id)) {
      map.set(weapon.id, {
        slug: weapon.id,
        name: weapon.name,
        image: weapon.image,
        category: weapon.category,
      });
    }
  });

  return Array.from(map.values());
}