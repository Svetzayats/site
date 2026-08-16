export type Rating = 'below' | 'at' | 'above';

export interface AnswerInput {
	competencyId: string;
	rating: Rating;
	notes: string;
}

export interface Answer {
	competencyId: string;
	rating: Rating;
	notes: string | null;
}

export interface SelfAssessmentSummary {
	id: string;
	level: string;
	created_at: string;
}

export interface SelfAssessment extends SelfAssessmentSummary {
	answers: Answer[];
}

export interface Review {
	id: string;
	reviewerName: string;
	selfAssessmentId: string;
	created_at: string;
	answers: Answer[];
}

interface AnswerRow {
	competency_id: string;
	rating: Rating;
	notes: string | null;
}

async function getAnswers(
	db: D1Database,
	table: string,
	parentColumn: string,
	parentId: string,
): Promise<Answer[]> {
	const result = await db
		.prepare(`SELECT competency_id, rating, notes FROM ${table} WHERE ${parentColumn} = ?`)
		.bind(parentId)
		.all<AnswerRow>();
	return result.results.map((row) => ({
		competencyId: row.competency_id,
		rating: row.rating,
		notes: row.notes,
	}));
}

function insertAnswerStatements(
	db: D1Database,
	table: string,
	parentColumn: string,
	parentId: string,
	answers: AnswerInput[],
) {
	return answers.map((answer) =>
		db
			.prepare(
				`INSERT INTO ${table} (${parentColumn}, competency_id, rating, notes) VALUES (?, ?, ?, ?)`,
			)
			.bind(parentId, answer.competencyId, answer.rating, answer.notes || null),
	);
}

export async function createSelfAssessment(
	db: D1Database,
	level: string,
	answers: AnswerInput[],
): Promise<string> {
	const id = crypto.randomUUID();
	const created_at = new Date().toISOString();

	await db
		.prepare('INSERT INTO cm_self_assessments (id, level, created_at) VALUES (?, ?, ?)')
		.bind(id, level, created_at)
		.run();

	if (answers.length > 0) {
		await db.batch(
			insertAnswerStatements(db, 'cm_self_assessment_answers', 'assessment_id', id, answers),
		);
	}

	return id;
}

export async function getAllSelfAssessments(db: D1Database): Promise<SelfAssessmentSummary[]> {
	const result = await db
		.prepare('SELECT id, level, created_at FROM cm_self_assessments ORDER BY created_at DESC')
		.all<SelfAssessmentSummary>();
	return result.results;
}

export async function getAllSelfAssessmentsDetailed(db: D1Database): Promise<SelfAssessment[]> {
	const summaries = await getAllSelfAssessments(db);
	const detailed: SelfAssessment[] = [];
	for (const summary of summaries) {
		const answers = await getAnswers(db, 'cm_self_assessment_answers', 'assessment_id', summary.id);
		detailed.push({ ...summary, answers });
	}
	return detailed;
}

export async function getSelfAssessment(
	db: D1Database,
	id: string,
): Promise<SelfAssessment | null> {
	const row = await db
		.prepare('SELECT id, level, created_at FROM cm_self_assessments WHERE id = ?')
		.bind(id)
		.first<SelfAssessmentSummary>();
	if (!row) return null;
	const answers = await getAnswers(db, 'cm_self_assessment_answers', 'assessment_id', id);
	return { ...row, answers };
}

export async function getLatestSelfAssessment(db: D1Database): Promise<SelfAssessment | null> {
	const row = await db
		.prepare('SELECT id, level, created_at FROM cm_self_assessments ORDER BY created_at DESC LIMIT 1')
		.first<SelfAssessmentSummary>();
	if (!row) return null;
	const answers = await getAnswers(db, 'cm_self_assessment_answers', 'assessment_id', row.id);
	return { ...row, answers };
}

export async function createReview(
	db: D1Database,
	reviewerName: string,
	selfAssessmentId: string,
	answers: AnswerInput[],
): Promise<string> {
	const id = crypto.randomUUID();
	const created_at = new Date().toISOString();

	await db
		.prepare(
			'INSERT INTO cm_reviews (id, reviewer_name, self_assessment_id, created_at) VALUES (?, ?, ?, ?)',
		)
		.bind(id, reviewerName, selfAssessmentId, created_at)
		.run();

	if (answers.length > 0) {
		await db.batch(insertAnswerStatements(db, 'cm_review_answers', 'review_id', id, answers));
	}

	return id;
}

interface ReviewRow {
	id: string;
	reviewer_name: string;
	self_assessment_id: string;
	created_at: string;
}

async function hydrateReviews(db: D1Database, rows: ReviewRow[]): Promise<Review[]> {
	const reviews: Review[] = [];
	for (const row of rows) {
		const answers = await getAnswers(db, 'cm_review_answers', 'review_id', row.id);
		reviews.push({
			id: row.id,
			reviewerName: row.reviewer_name,
			selfAssessmentId: row.self_assessment_id,
			created_at: row.created_at,
			answers,
		});
	}
	return reviews;
}

export async function getReviewsByReviewer(db: D1Database, reviewerName: string): Promise<Review[]> {
	const result = await db
		.prepare(
			'SELECT id, reviewer_name, self_assessment_id, created_at FROM cm_reviews WHERE reviewer_name = ? ORDER BY created_at DESC',
		)
		.bind(reviewerName)
		.all<ReviewRow>();
	return hydrateReviews(db, result.results);
}

export async function getAllReviews(db: D1Database): Promise<Review[]> {
	const result = await db
		.prepare(
			'SELECT id, reviewer_name, self_assessment_id, created_at FROM cm_reviews ORDER BY created_at DESC',
		)
		.all<ReviewRow>();
	return hydrateReviews(db, result.results);
}
