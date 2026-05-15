import type { NavigateFunction } from "react-router-dom";
import type { INavigationService } from "@/services/contracts/INavigationService";

export class ReactRouterNavigationService implements INavigationService {
  constructor(private readonly navigate: NavigateFunction) {}
  go(path: string, opts?: { replace?: boolean }): void {
    this.navigate(path, { replace: opts?.replace ?? false });
  }
  back(): void {
    this.navigate(-1);
  }
}
