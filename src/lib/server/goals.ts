export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type GoalVisibility = 'private' | 'public';

export interface GoalStep {
	id: string;
	description: string;
	startDate: string | null;
	dueDate: string | null;
	done: boolean;
}

export interface GoalProgressEntry {
	id: string;
	date: string;
	note: string;
}

export interface Goal {
	id: string;
	title: string;
	purpose: string | null;
	challenges: string | null;
	isSpecific: boolean;
	isMeasurable: boolean;
	isAchievable: boolean;
	isRelevant: boolean;
	isTimeBound: boolean;
	targetDate: string | null;
	status: GoalStatus;
	visibility: GoalVisibility;
	steps: GoalStep[];
	progressLog: GoalProgressEntry[];
	created_at: string;
	updated_at: string;
}

export interface GoalInput {
	title: string;
	purpose: string;
	challenges: string;
	isSpecific: boolean;
	isMeasurable: boolean;
	isAchievable: boolean;
	isRelevant: boolean;
	isTimeBound: boolean;
	targetDate: string | null;
	status: GoalStatus;
	visibility: GoalVisibility;
}

export interface FocusItem {
	goalId: string;
	goalTitle: string;
	kind: 'goal' | 'step';
	stepId?: string;
	label: string;
	dueDate: string;
}

export interface FocusItems {
	overdue: FocusItem[];
	dueThisWeek: FocusItem[];
}

interface GoalRow {
	id: string;
	title: string;
	purpose: string | null;
	challenges: string | null;
	is_specific: number;
	is_measurable: number;
	is_achievable: number;
	is_relevant: number;
	is_time_bound: number;
	target_date: string | null;
	status: GoalStatus;
	visibility: GoalVisibility;
	steps: string;
	progress_log: string;
	created_at: string;
	updated_at: string;
}

function parseJsonArray<T>(raw: string | null | undefined): T[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as T[]) : [];
	} catch {
		return [];
	}
}

function hydrateGoal(row: GoalRow): Goal {
	return {
		id: row.id,
		title: row.title,
		purpose: row.purpose,
		challenges: row.challenges,
		isSpecific: !!row.is_specific,
		isMeasurable: !!row.is_measurable,
		isAchievable: !!row.is_achievable,
		isRelevant: !!row.is_relevant,
		isTimeBound: !!row.is_time_bound,
		targetDate: row.target_date,
		status: row.status,
		visibility: row.visibility,
		steps: parseJsonArray<GoalStep>(row.steps),
		progressLog: parseJsonArray<GoalProgressEntry>(row.progress_log),
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

const GOAL_COLUMNS =
	'id, title, purpose, challenges, is_specific, is_measurable, is_achievable, is_relevant, is_time_bound, target_date, status, visibility, steps, progress_log, created_at, updated_at';

export async function createGoal(
	db: D1Database,
	input: GoalInput,
	steps: GoalStep[] = [],
): Promise<string> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO cm_goals (id, title, purpose, challenges, is_specific, is_measurable, is_achievable, is_relevant, is_time_bound, target_date, status, visibility, steps, progress_log, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)`,
		)
		.bind(
			id,
			input.title,
			input.purpose || null,
			input.challenges || null,
			input.isSpecific ? 1 : 0,
			input.isMeasurable ? 1 : 0,
			input.isAchievable ? 1 : 0,
			input.isRelevant ? 1 : 0,
			input.isTimeBound ? 1 : 0,
			input.targetDate,
			input.status,
			input.visibility,
			JSON.stringify(steps),
			now,
			now,
		)
		.run();

	return id;
}

export async function getAllGoals(db: D1Database): Promise<Goal[]> {
	const result = await db
		.prepare(
			`SELECT ${GOAL_COLUMNS} FROM cm_goals
			 ORDER BY CASE WHEN target_date IS NULL THEN 1 ELSE 0 END, target_date ASC, created_at DESC`,
		)
		.all<GoalRow>();
	return result.results.map(hydrateGoal);
}

export async function getPublicGoals(db: D1Database): Promise<Goal[]> {
	const result = await db
		.prepare(
			`SELECT ${GOAL_COLUMNS} FROM cm_goals WHERE visibility = 'public'
			 ORDER BY CASE WHEN target_date IS NULL THEN 1 ELSE 0 END, target_date ASC, created_at DESC`,
		)
		.all<GoalRow>();
	return result.results.map(hydrateGoal);
}

export async function getGoal(db: D1Database, id: string): Promise<Goal | null> {
	const row = await db
		.prepare(`SELECT ${GOAL_COLUMNS} FROM cm_goals WHERE id = ?`)
		.bind(id)
		.first<GoalRow>();
	return row ? hydrateGoal(row) : null;
}

export async function updateGoal(
	db: D1Database,
	id: string,
	input: GoalInput,
	steps: GoalStep[],
): Promise<void> {
	const now = new Date().toISOString();
	await db
		.prepare(
			`UPDATE cm_goals SET
			 title = ?, purpose = ?, challenges = ?,
			 is_specific = ?, is_measurable = ?, is_achievable = ?, is_relevant = ?, is_time_bound = ?,
			 target_date = ?, status = ?, visibility = ?, steps = ?, updated_at = ?
			 WHERE id = ?`,
		)
		.bind(
			input.title,
			input.purpose || null,
			input.challenges || null,
			input.isSpecific ? 1 : 0,
			input.isMeasurable ? 1 : 0,
			input.isAchievable ? 1 : 0,
			input.isRelevant ? 1 : 0,
			input.isTimeBound ? 1 : 0,
			input.targetDate,
			input.status,
			input.visibility,
			JSON.stringify(steps),
			now,
			id,
		)
		.run();
}

export async function deleteGoal(db: D1Database, id: string): Promise<void> {
	await db.prepare('DELETE FROM cm_goals WHERE id = ?').bind(id).run();
}

export async function toggleGoalStep(db: D1Database, goalId: string, stepId: string): Promise<void> {
	const row = await db
		.prepare('SELECT steps FROM cm_goals WHERE id = ?')
		.bind(goalId)
		.first<{ steps: string }>();
	if (!row) return;

	const steps = parseJsonArray<GoalStep>(row.steps).map((step) =>
		step.id === stepId ? { ...step, done: !step.done } : step,
	);

	await db
		.prepare('UPDATE cm_goals SET steps = ?, updated_at = ? WHERE id = ?')
		.bind(JSON.stringify(steps), new Date().toISOString(), goalId)
		.run();
}

export async function addGoalProgressEntry(
	db: D1Database,
	goalId: string,
	note: string,
	date?: string,
): Promise<void> {
	const row = await db
		.prepare('SELECT progress_log FROM cm_goals WHERE id = ?')
		.bind(goalId)
		.first<{ progress_log: string }>();
	if (!row) return;

	const progressLog = parseJsonArray<GoalProgressEntry>(row.progress_log);
	progressLog.push({
		id: crypto.randomUUID(),
		date: date || new Date().toISOString().slice(0, 10),
		note,
	});

	await db
		.prepare('UPDATE cm_goals SET progress_log = ?, updated_at = ? WHERE id = ?')
		.bind(JSON.stringify(progressLog), new Date().toISOString(), goalId)
		.run();
}

const ACTIVE_STATUSES: GoalStatus[] = ['not_started', 'in_progress'];

function addDaysIso(iso: string, days: number): string {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

export function computeFocusItems(
	goals: Goal[],
	todayIso: string = new Date().toISOString().slice(0, 10),
): FocusItems {
	const weekAheadIso = addDaysIso(todayIso, 7);
	const overdue: FocusItem[] = [];
	const dueThisWeek: FocusItem[] = [];

	const bucket = (item: FocusItem) => {
		if (item.dueDate < todayIso) overdue.push(item);
		else if (item.dueDate <= weekAheadIso) dueThisWeek.push(item);
	};

	for (const goal of goals) {
		if (!ACTIVE_STATUSES.includes(goal.status)) continue;

		if (goal.targetDate) {
			bucket({
				goalId: goal.id,
				goalTitle: goal.title,
				kind: 'goal',
				label: goal.title,
				dueDate: goal.targetDate,
			});
		}

		for (const step of goal.steps) {
			if (step.done || !step.dueDate) continue;
			bucket({
				goalId: goal.id,
				goalTitle: goal.title,
				kind: 'step',
				stepId: step.id,
				label: `${goal.title}: ${step.description}`,
				dueDate: step.dueDate,
			});
		}
	}

	overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
	dueThisWeek.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

	return { overdue, dueThisWeek };
}
