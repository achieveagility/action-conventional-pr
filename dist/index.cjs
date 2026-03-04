Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/verbs.ts
const defaultImperativeVerbs = [
	"add",
	"adjust",
	"bump",
	"change",
	"clean",
	"create",
	"disable",
	"document",
	"drop",
	"enable",
	"fix",
	"implement",
	"improve",
	"introduce",
	"migrate",
	"refactor",
	"remove",
	"rename",
	"replace",
	"revert",
	"simplify",
	"update",
	"upgrade"
];

//#endregion
//#region src/parsing.ts
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeVerbs(input) {
	if (!input) return [];
	return input.map((verb) => verb.trim().toLowerCase()).filter((verb) => verb.length > 0);
}
function getAllowedVerbs(options) {
	const verbs = normalizeVerbs(options.verbs);
	const addVerbs = normalizeVerbs(options.addVerbs);
	if (verbs.length > 0 && addVerbs.length > 0) throw new Error("verbs and add-verbs cannot both be set. Use verbs to override or add-verbs to extend defaults.");
	if (options.verbs && verbs.length === 0) throw new Error("verbs must contain at least one non-empty verb when provided.");
	if (verbs.length > 0) return new Set(verbs);
	if (addVerbs.length > 0) return new Set([...defaultImperativeVerbs, ...addVerbs]);
	return new Set(defaultImperativeVerbs);
}
function parseBooleanInput(name, value) {
	const normalized = value.trim().toLowerCase();
	if (normalized === "true") return true;
	if (normalized === "false") return false;
	throw new Error(`${name} must be either 'true' or 'false'.`);
}
function parseVerbsInput(input) {
	if (input.trim().length === 0) return;
	return input.split(",").map((verb) => verb.trim()).filter((verb) => verb.length > 0);
}
function parseIssuePrefixInput(input) {
	const values = input.split(",").map((value) => value.trim()).filter((value) => value.length > 0);
	if (values.length === 0) return;
	return values.length === 1 ? values[0] : values;
}
function parseIssueModeInput(value) {
	const normalized = value.trim().toLowerCase();
	if (normalized === "optional" || normalized === "required") return normalized;
	throw new Error("issue-mode must be either 'optional' or 'required'.");
}

//#endregion
//#region src/validator.ts
function createPullRequestTitleValidator(options = {}) {
	const issuePrefixes = Array.isArray(options.issuePrefix) ? options.issuePrefix.map((prefix) => prefix.trim()).filter((prefix) => prefix.length > 0) : options.issuePrefix ? [options.issuePrefix.trim()].filter((prefix) => prefix.length > 0) : [];
	const issueMode = options.issueMode ?? "optional";
	const issueUnknown = options.issueUnknown ?? false;
	const issueNearMiss = options.issueNearMiss ?? false;
	const trailingPunctuation = options.trailingPunctuation ?? false;
	const enforceLowercase = options.enforceLowercase ?? true;
	const allowedVerbs = getAllowedVerbs({
		verbs: options.verbs,
		addVerbs: options.addVerbs
	});
	const trailingIssueLikeSuffixRegex = new RegExp(`^(.*)\\s([a-z][a-z0-9_]*-[0-9]+|#[0-9]+)$`, "i");
	const issuePrefixConfigs = issuePrefixes.map((issuePrefix) => {
		const escapedPrefix = escapeRegExp(issuePrefix);
		const issuePrefixNearMissBase = issuePrefix.replace(/[^a-z0-9]+$/i, "");
		return {
			issuePrefix,
			validTicketRegex: new RegExp(`^(.*)\\s(${escapedPrefix}[1-9][0-9]*)$`),
			prefixedSuffixRegex: new RegExp(`\\s${escapedPrefix}[0-9]+$`),
			issueNearMissRegex: issuePrefixNearMissBase !== issuePrefix ? new RegExp(`\\s${escapeRegExp(issuePrefixNearMissBase)}[0-9]+$`, "i") : null
		};
	});
	const getIssueSuffixErrorMessage = () => {
		if (issuePrefixes.length === 1) {
			const issuePrefix = issuePrefixes[0];
			return `Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`;
		}
		return `Issue suffix is invalid. Expected one of: ${issuePrefixes.map((issuePrefix) => `'${issuePrefix}<positive-integer>'`).join(", ")}.`;
	};
	if (issueMode === "required" && issuePrefixes.length === 0 && !issueUnknown) throw new Error("Invalid issue configuration. issue-mode 'required' needs issue-prefix or issue-unknown=true.");
	return ({ title }) => {
		if (title === "") throw new Error("Unable to validate PR title. title is empty.");
		if (/^[^:]+:\s*$/.test(title)) throw new Error("PR subject cannot be empty.");
		if (title !== title.trim()) throw new Error("PR title cannot have leading or trailing whitespace.");
		if (/ {2,}/.test(title)) throw new Error("PR title cannot contain repeated spaces.");
		if (enforceLowercase && /[A-Z]/.test(title)) throw new Error("PR title must be all lowercase.");
		const titleMatch = /^[^:]+:\s+(.+)$/.exec(title);
		if (!titleMatch) throw new Error("PR title must include a subject after ': '.");
		const subject = titleMatch[1];
		let subjectCore = subject;
		let hasKnownIssueSuffix = false;
		let hasUnknownIssueSuffix = false;
		if (issuePrefixConfigs.length > 0) {
			const validPrefixConfig = issuePrefixConfigs.find(({ validTicketRegex }) => validTicketRegex.test(subject));
			if (validPrefixConfig) {
				const validMatch = validPrefixConfig.validTicketRegex.exec(subject);
				hasKnownIssueSuffix = true;
				subjectCore = validMatch?.[1] ?? subjectCore;
			} else {
				if (issuePrefixConfigs.find(({ issueNearMissRegex, prefixedSuffixRegex }) => prefixedSuffixRegex.test(subject) || !!issueNearMissRegex && issueNearMissRegex.test(subject) && !issueNearMiss)) throw new Error(getIssueSuffixErrorMessage());
				const trailingIssueMatch = trailingIssueLikeSuffixRegex.exec(subject);
				if (trailingIssueMatch) {
					hasUnknownIssueSuffix = true;
					if (!issueUnknown) throw new Error(getIssueSuffixErrorMessage());
					subjectCore = trailingIssueMatch[1];
				}
			}
		} else {
			const trailingIssueMatch = trailingIssueLikeSuffixRegex.exec(subjectCore);
			if (trailingIssueMatch) {
				hasUnknownIssueSuffix = true;
				if (!issueUnknown) throw new Error("Issue suffix is not allowed unless issue-unknown is true or issue-prefix is configured.");
				subjectCore = trailingIssueMatch[1];
			}
		}
		if (issueMode === "required" && !hasKnownIssueSuffix && !hasUnknownIssueSuffix) throw new Error("Issue suffix is required by issue-mode 'required'.");
		if (subjectCore.length === 0) throw new Error("PR subject cannot be empty.");
		if (!trailingPunctuation && /[.!?,;:]$/.test(subjectCore)) throw new Error("PR subject cannot end with trailing punctuation.");
		const firstWord = (subjectCore.split(" ")[0] ?? "").toLowerCase();
		if (!allowedVerbs.has(firstWord)) throw new Error(["PR subject must start with an allowed imperative verb,", `for example: ${Array.from(allowedVerbs).map((verb) => `'${verb}'`).join(", ")}.`].join(" "));
	};
}

//#endregion
//#region src/runtime.ts
function runFromEnv() {
	const title = process.env.PR_TITLE ?? "";
	const issuePrefix = process.env.ISSUE_PREFIX ?? "";
	const issueModeInput = process.env.ISSUE_MODE ?? "optional";
	const issueUnknownInput = process.env.ISSUE_UNKNOWN ?? "false";
	const issueNearMissInput = process.env.ISSUE_NEAR_MISS ?? "false";
	const trailingPunctuationInput = process.env.TRAILING_PUNCTUATION ?? "false";
	const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
	const verbsInput = process.env.VERBS ?? "";
	const addVerbsInput = process.env.ADD_VERBS ?? "";
	createPullRequestTitleValidator({
		issuePrefix: parseIssuePrefixInput(issuePrefix),
		issueMode: parseIssueModeInput(issueModeInput),
		issueUnknown: parseBooleanInput("issue-unknown", issueUnknownInput),
		issueNearMiss: parseBooleanInput("issue-near-miss", issueNearMissInput),
		trailingPunctuation: parseBooleanInput("trailing-punctuation", trailingPunctuationInput),
		enforceLowercase: parseBooleanInput("enforce-lowercase", enforceLowercaseInput),
		verbs: parseVerbsInput(verbsInput),
		addVerbs: parseVerbsInput(addVerbsInput)
	})({ title });
}

//#endregion
//#region src/index.ts
if (require.main === module) try {
	runFromEnv();
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`::error::${message}`);
	process.exit(1);
}

//#endregion
exports.createPullRequestTitleValidator = createPullRequestTitleValidator;