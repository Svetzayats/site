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
import type { Actions, PageServerLoad } from './$types';

const CM_REVIEWER_COOKIE = 'cm_reviewer_session';

function isReviewerAuthenticated(cookies: Cookies, platform: App.Platform | undefined): boolean {
	const reviewerPassword = platform?.env?.CM_REVIEWER_PASSWORD;
	return !!reviewerPassword && cookies.get(CM_REVIEWER_COOKIE) === reviewerPassword;
}

function isLevel(value: string | null): value is Level {
	return !!value && (LEVELS as readonly string[]).includes(value);
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
};
