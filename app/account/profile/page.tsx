import { PageTitle } from "@/components/account-shell";
import { ProfileForm } from "@/components/profile-form";
import { requireCustomer } from "@/lib/account";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const sessionUser = await requireCustomer();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { name: true, email: true, phone: true, passwordHash: true },
  });

  return <>
    <PageTitle title="My Profile" />
    <ProfileForm
      user={{ name: user.name, email: user.email, phone: user.phone }}
      canChangePassword={Boolean(user.passwordHash)}
    />
  </>;
}
