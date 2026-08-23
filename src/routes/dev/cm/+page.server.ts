import { fail } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { isAdminAuthenticated } from '$lib/server/auth';
import {
	COMPETENCIES,
	LEVELS,
	RADAR_THEMES,
	compareLevels,
	levelScore,
	type Level,
} from '$lib/data/competency-matrix';
import {
	createSelfAssessment,
	createReview,
	getAllSelfAssessmentsDetailed,
	getAllReviews,
	getLatestSelfAssessment,
	getReviewsByReviewer,
	type Answer,
	type AnswerInput,
} from '$lib/server/competency-matrix';
import {
	createGoal as dbCreateGoal,
	updateGoal as dbUpdateGoal,
	deleteGoal as dbDeleteGoal,
	toggleGoalStep as dbToggleGoalStep,
	addGoalProgressEntry as dbAddGoalProgressEntry,
	getAllGoals,
	getPublicGoals,
	computeFocusItems,
	type GoalInput,
	type GoalStatus,
	type GoalVisibility,
	type GoalStep,
} from '$lib/server/goals';
import type { Actions, PageServerLoad } from './$types';

const CM_REVIEWER_COOKIE = 'cm_reviewer_session';

function isReviewerAuthenticated(cookies: Cookies, platform: App.Platform | undefined): boolean {
	const reviewerPassword = platform?.env?.CM_REVIEWER_PASSWORD;
	return !!reviewerPassword && cookies.get(CM_REVIEWER_COOKIE) === reviewerPassword;
}

function isLevel(value: string | null): value is Level {
	return !!value && (LEVELS as readonly string[]).includes(value);
}

const GOAL_STATUSES: GoalStatus[] = ['not_started', 'in_progress', 'completed', 'abandoned'];

function isGoalStatus(value: string | null): value is GoalStatus {
	return !!value && GOAL_STATUSES.includes(value as GoalStatus);
}

function isGoalVisibility(value: string | null): value is GoalVisibility {
	return value === 'private' || value === 'public';
}

function parseGoalInput(formData: FormData): GoalInput | null {
	const title = ((formData.get('title') as string | null) ?? '').trim();
	const status = formData.get('status') as string | null;
	const visibility = (formData.get('visibility') as string | null) || 'private';
	if (!title || !isGoalStatus(status) || !isGoalVisibility(visibility)) return null;

	return {
		title,
		purpose: ((formData.get('purpose') as string | null) ?? '').trim(),
		challenges: ((formData.get('challenges') as string | null) ?? '').trim(),
		isSpecific: formData.get('is_specific') === 'on',
		isMeasurable: formData.get('is_measurable') === 'on',
		isAchievable: formData.get('is_achievable') === 'on',
		isRelevant: formData.get('is_relevant') === 'on',
		isTimeBound: formData.get('is_time_bound') === 'on',
		targetDate: ((formData.get('targetDate') as string | null) ?? '').trim() || null,
		status,
		visibility,
	};
}

function parseStepsJson(raw: string | null): GoalStep[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(s): s is { id?: unknown; description: string; startDate?: unknown; dueDate?: unknown; done?: unknown } =>
					!!s && typeof s.description === 'string' && s.description.trim().length > 0,
			)
			.map((s) => ({
				id: typeof s.id === 'string' && s.id ? s.id : crypto.randomUUID(),
				description: s.description.trim(),
				startDate: (s.startDate as string) || null,
				dueDate: (s.dueDate as string) || null,
				done: !!s.done,
			}));
	} catch {
		return [];
	}
}

function parseAnswers(formData: FormData, targetLevel: Level): AnswerInput[] {
	const answers: AnswerInput[] = [];
	for (const competency of COMPETENCIES) {
		const level = formData.get(`level_${competency.id}`) as string | null;
		if (isLevel(level)) {
			const notes = (formData.get(`notes_${competency.id}`) as string | null) ?? '';
			const accomplishments =
				(formData.get(`accomplishments_${competency.id}`) as string | null) ?? '';
			const opportunities =
				(formData.get(`opportunities_${competency.id}`) as string | null) ?? '';
			answers.push({
				competencyId: competency.id,
				level,
				rating: compareLevels(level, targetLevel),
				notes: notes.trim(),
				accomplishments: accomplishments.trim(),
				opportunities: opportunities.trim(),
			});
		}
	}
	return answers;
}

const THEME_BY_COMPETENCY_ID = new Map(COMPETENCIES.map((c) => [c.id, c.theme]));

function themeAverageScores(answers: Answer[]): Record<string, number | null> {
	const scoresByTheme = new Map<string, number[]>();
	for (const theme of RADAR_THEMES) scoresByTheme.set(theme, []);

	for (const answer of answers) {
		if (!answer.level) continue;
		const theme = THEME_BY_COMPETENCY_ID.get(answer.competencyId);
		if (!theme) continue;
		const scores = scoresByTheme.get(theme);
		if (!scores) continue;
		scores.push(levelScore(answer.level));
	}

	const result: Record<string, number | null> = {};
	for (const [theme, scores] of scoresByTheme) {
		result[theme] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
	}
	return result;
}

export const load: PageServerLoad = async ({ cookies, url, platform }) => {
	const db = platform?.env?.quotes_db;
	const admin = isAdminAuthenticated(cookies, platform);
	const reviewer = isReviewerAuthenticated(cookies, platform);
	const reviewerName = url.searchParams.get('reviewerName')?.trim() || null;

	const selfAssessments = admin && db ? await getAllSelfAssessmentsDetailed(db) : [];
	const allReviews = admin && db ? await getAllReviews(db) : [];
	const latestSelfAssessment = reviewer && db ? await getLatestSelfAssessment(db) : null;
	const myReviews = reviewer && db && reviewerName ? await getReviewsByReviewer(db, reviewerName) : [];

	const goals = admin && db && selfAssessments.length > 0 ? await getAllGoals(db) : [];
	const focusItems = computeFocusItems(goals);
	const focus = {
		overdueGoalIds: new Set(focusItems.overdue.filter((i) => i.kind === 'goal').map((i) => i.goalId)),
		dueSoonGoalIds: new Set(focusItems.dueThisWeek.filter((i) => i.kind === 'goal').map((i) => i.goalId)),
		overdueStepIds: new Set(focusItems.overdue.filter((i) => i.kind === 'step').map((i) => i.stepId!)),
		dueSoonStepIds: new Set(focusItems.dueThisWeek.filter((i) => i.kind === 'step').map((i) => i.stepId!)),
	};
	const publicGoals = reviewer && db ? await getPublicGoals(db) : [];

	const latestForRadar = selfAssessments[0] ?? null;
	const matchingReviews = latestForRadar
		? allReviews.filter((r) => r.selfAssessmentId === latestForRadar.id)
		: [];
	const radar = latestForRadar
		? {
				themes: RADAR_THEMES,
				self: themeAverageScores(latestForRadar.answers),
				reviewer:
					matchingReviews.length > 0
						? themeAverageScores(matchingReviews.flatMap((r) => r.answers))
						: null,
			}
		: null;

	return {
		admin,
		reviewer,
		reviewerName,
		selfAssessments,
		allReviews,
		latestSelfAssessment,
		myReviews,
		radar,
		goals,
		focusItems,
		focus,
		publicGoals,
	};
};

export const actions: Actions = {
	loginAdmin: async ({ request, cookies, platform }) => {
		const adminPassword = platform?.env?.ADMIN_PASSWORD;
		const formData = await request.formData();
		const password = formData.get('password') as string;

		if (!adminPassword || password !== adminPassword) {
			return fail(401, { adminError: 'Wrong password' });
		}

		cookies.set('admin_session', adminPassword, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7,
		});
	},

	loginReviewer: async ({ request, cookies, platform }) => {
		const reviewerPassword = platform?.env?.CM_REVIEWER_PASSWORD;
		const formData = await request.formData();
		const password = formData.get('password') as string;

		if (!reviewerPassword || password !== reviewerPassword) {
			return fail(401, { reviewerError: 'Wrong password' });
		}

		cookies.set(CM_REVIEWER_COOKIE, reviewerPassword, {
			path: '/dev/cm',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7,
		});
	},

	submitSelfAssessment: async ({ request, cookies, platform }) => {
		if (!isAdminAuthenticated(cookies, platform)) {
			return fail(401, { selfError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { selfError: 'Database unavailable' });

		const formData = await request.formData();
		const level = formData.get('level') as string | null;
		if (!isLevel(level)) {
			return fail(400, { selfError: 'Invalid level' });
		}

		const answers = parseAnswers(formData, level);
		await createSelfAssessment(db, level, answers);
	},

	submitReview: async ({ request, cookies, platform }) => {
		if (!isReviewerAuthenticated(cookies, platform)) {
			return fail(401, { reviewError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { reviewError: 'Database unavailable' });

		const formData = await request.formData();
		const reviewerName = (formData.get('reviewerName') as string | null)?.trim();
		if (!reviewerName) {
			return fail(400, { reviewError: 'Missing reviewer name' });
		}

		const latest = await getLatestSelfAssessment(db);
		if (!latest) {
			return fail(400, { reviewError: 'There is no self-assessment to review yet' });
		}

		const answers = parseAnswers(formData, latest.level as Level);
		await createReview(db, reviewerName, latest.id, answers);
	},

	createGoal: async ({ request, cookies, platform }) => {
		if (!isAdminAuthenticated(cookies, platform)) {
			return fail(401, { goalError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { goalError: 'Database unavailable' });

		const formData = await request.formData();
		const input = parseGoalInput(formData);
		if (!input) {
			return fail(400, { goalError: 'Please fill in the goal statement and status' });
		}
		const steps = parseStepsJson(formData.get('stepsJson') as string | null);
		await dbCreateGoal(db, input, steps);
	},

	updateGoal: async ({ request, cookies, platform }) => {
		if (!isAdminAuthenticated(cookies, platform)) {
			return fail(401, { goalError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { goalError: 'Database unavailable' });

		const formData = await request.formData();
		const id = formData.get('id') as string | null;
		if (!id) return fail(400, { goalError: 'Missing goal id' });

		const input = parseGoalInput(formData);
		if (!input) {
			return fail(400, { goalError: 'Please fill in the goal statement and status' });
		}
		const steps = parseStepsJson(formData.get('stepsJson') as string | null);
		await dbUpdateGoal(db, id, input, steps);
	},

	deleteGoal: async ({ request, cookies, platform }) => {
		if (!isAdminAuthenticated(cookies, platform)) {
			return fail(401, { goalError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { goalError: 'Database unavailable' });

		const formData = await request.formData();
		const id = formData.get('id') as string | null;
		if (!id) return fail(400, { goalError: 'Missing goal id' });

		await dbDeleteGoal(db, id);
	},

	toggleGoalStep: async ({ request, cookies, platform }) => {
		if (!isAdminAuthenticated(cookies, platform)) {
			return fail(401, { goalError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { goalError: 'Database unavailable' });

		const formData = await request.formData();
		const id = formData.get('id') as string | null;
		const stepId = formData.get('stepId') as string | null;
		if (!id || !stepId) return fail(400, { goalError: 'Missing goal or step id' });

		await dbToggleGoalStep(db, id, stepId);
	},

	addGoalProgressEntry: async ({ request, cookies, platform }) => {
		if (!isAdminAuthenticated(cookies, platform)) {
			return fail(401, { goalError: 'Unauthorized' });
		}
		const db = platform?.env?.quotes_db;
		if (!db) return fail(500, { goalError: 'Database unavailable' });

		const formData = await request.formData();
		const id = formData.get('id') as string | null;
		const note = ((formData.get('note') as string | null) ?? '').trim();
		const date = (formData.get('date') as string | null) || new Date().toISOString().slice(0, 10);
		if (!id || !note) return fail(400, { goalError: 'Missing progress note' });

		await dbAddGoalProgressEntry(db, id, note, date);
	},
};
