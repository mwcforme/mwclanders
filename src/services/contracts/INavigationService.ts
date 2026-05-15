/**
 * Thin wrapper over react-router navigation so step components remain
 * trivially testable without mounting a router in unit tests.
 */
export interface INavigationService {
  go(path: string, opts?: { replace?: boolean }): void;
  back(): void;
}
