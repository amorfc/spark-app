export enum BlogCategory {
	SelfDefense = "selfDefense",
	TedTalks = "tedTalks",
	MovieRecommendations = "movieRecommendations",
	BookRecommendations = "bookRecommendations",
	InspiringWoman = "inspiringWoman",
	WomanMurders = "womanMurders",
	ToxicRelationships = "toxicRelationships",
	VideoEssays = "videoEssays",
	WomanAnatomyAndPeriod = "womanAnatomyAndPeriod",
	Podcasts = "podcasts",
	SelfLove = "selfLove",
	FeminismBasics = "feminismBasics",
}

export interface BlogPost {
	id: string;
	category: BlogCategory;
	title: string;
	link: string;
	image: string;
}

export interface CreateBlogPostInput {
	category: BlogCategory;
	title: string;
	link: string;
	image?: string;
}

export interface CategoryOption {
	id: BlogCategory;
	name: string;
	displayName: string;
}
