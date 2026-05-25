/**
 * Minimal schema validator — replaces zod for the lead/booking forms.
 * Implements only the subset used by leadFormSchema.ts.
 * API-compatible with ZodSchema<T>.safeParse() so useLeadSubmitController works unchanged.
 *
 * Benefits: ~50 bytes vs zod's ~50KB.
 */

type Issue = { path: (string | number)[]; message: string };
type Success<T> = { success: true; data: T };
type Failure = { success: false; error: { issues: Issue[] } };
type ParseResult<T> = Success<T> | Failure;

interface Schema<T> {
  safeParse(raw: unknown): ParseResult<T>;
}

const ok = <T>(data: T): Success<T> => ({ success: true, data });
const fail = (issues: Issue[]): Failure => ({ success: false, error: { issues } });

/** String field with optional trim, min, max */
function str(): {
  trim(): ReturnType<typeof str>;
  min(n: number, msg: string): ReturnType<typeof str>;
  max(n: number, msg: string): ReturnType<typeof str>;
  email(msg: string): ReturnType<typeof str>;
  transform<U>(fn: (v: string) => U): StrTransform<U>;
  optional(): Schema<string | undefined>;
  readonly _rules: Array<(v: string) => string | null>;
  safeParse(raw: unknown): ParseResult<string>;
} {
  const rules: Array<(v: string) => string | null> = [];
  let doTrim = false;

  const chain: ReturnType<typeof str> = {
    _rules: rules,
    trim() { doTrim = true; return chain; },
    min(n, msg) { rules.push(v => v.length < n ? msg : null); return chain; },
    max(n, msg) { rules.push(v => v.length > n ? msg : null); return chain; },
    email(msg) { rules.push(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : msg); return chain; },
    transform<U>(fn: (v: string) => U) { return strTransform(chain, fn); },
    optional() { return optionalStr(chain); },
    safeParse(raw: unknown): ParseResult<string> {
      if (typeof raw !== "string") return fail([{ path: [], message: "Required" }]);
      const v = doTrim ? raw.trim() : raw;
      for (const r of rules) {
        const err = r(v);
        if (err) return fail([{ path: [], message: err }]);
      }
      return ok(v);
    },
  };
  return chain;
}

interface StrTransform<U> {
  refine(fn: (v: U) => boolean, msg: string): StrTransform<U>;
  optional(): Schema<U | undefined>;
  safeParse(raw: unknown): ParseResult<U>;
  _parse(raw: unknown): ParseResult<U>;
}

function strTransform<U>(base: ReturnType<typeof str>, transform: (v: string) => U): StrTransform<U> {
  const refines: Array<(v: U) => boolean | string> = [];
  const st: StrTransform<U> = {
    refine(fn, msg) {
      refines.push(v => fn(v) ? true : msg);
      return st;
    },
    optional() { return optionalTransform(st); },
    _parse(raw: unknown): ParseResult<U> {
      const r = base.safeParse(raw);
      if (!r.success) return r as Failure;

      const v = transform(r.data);
      for (const refine of refines) {
        const res = refine(v);
        if (res !== true) return fail([{ path: [], message: res as string }]);
      }
      return ok(v);
    },
    safeParse(raw: unknown): ParseResult<U> { return st._parse(raw); },
  };
  return st;
}

function optionalStr(base: ReturnType<typeof str>): Schema<string | undefined> {
  return {
    safeParse(raw: unknown): ParseResult<string | undefined> {
      if (raw === undefined || raw === null || raw === "") return ok(undefined);
      return base.safeParse(raw);
    },
  };
}

function optionalTransform<U>(base: StrTransform<U>): Schema<U | undefined> {
  return {
    safeParse(raw: unknown): ParseResult<U | undefined> {
      if (raw === undefined || raw === null || raw === "") return ok(undefined);
      return base.safeParse(raw);
    },
  };
}

/** Enum field */
function enumField<T extends string>(values: readonly T[], msg: string): Schema<T> {
  return {
    safeParse(raw: unknown): ParseResult<T> {
      if (values.includes(raw as T)) return ok(raw as T);
      return fail([{ path: [], message: msg }]);
    },
  };
}

/** Literal field (e.g. boolean true) */
function literal<const T>(value: T, msg: string): Schema<T> {
  return {
    safeParse(raw: unknown): ParseResult<T> {
      if (raw === value) return ok(value);
      return fail([{ path: [], message: msg }]);
    },
  };
}


type ObjectShape = Record<string, Schema<unknown>>;
type ObjectOutput<S extends ObjectShape> = { [K in keyof S]: S[K] extends Schema<infer T> ? T : never };

/** Object schema — validates each field and collects all errors */
function object<S extends ObjectShape>(shape: S): Schema<ObjectOutput<S>> {
  return {
    safeParse(raw: unknown): ParseResult<ObjectOutput<S>> {
      if (typeof raw !== "object" || raw === null) {
        return fail([{ path: [], message: "Expected object" }]);
      }
      const rec = raw as Record<string, unknown>;
      const issues: Issue[] = [];
      const out: Partial<ObjectOutput<S>> = {};

      for (const key of Object.keys(shape) as (keyof S)[]) {
        const result = shape[key].safeParse(rec[key as string]);
        if (result.success) {
          out[key] = result.data as ObjectOutput<S>[typeof key];
        } else {
          for (const issue of (result as Failure).error.issues) {
            issues.push({ path: [key as string, ...issue.path], message: issue.message });
          }
        }
      }


      if (issues.length) return fail(issues);
      return ok(out as ObjectOutput<S>);
    },
  };
}

export const m = { str, enumField, literal, object };
