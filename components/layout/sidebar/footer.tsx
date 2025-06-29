import { SidebarFooter, SidebarGroup, SidebarGroupContent } from "~/components/ui/sidebar"
import { SidebarUserNav, SidebarUserNavProps } from "./sidebar-user-nav"

export const UserSidebarFooter = (
  {user, className, status}: SidebarUserNavProps
) => {
  return (<SidebarFooter className="gap-0">
    {/* {displayUser && ( */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarUserNav user={user} status={status} />
        </SidebarGroupContent>
      </SidebarGroup>
    {/* )} */}
  </SidebarFooter>)
}