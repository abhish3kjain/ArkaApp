You can find Database Strucutre here:

MemberDB	(The Identity Core)	
Column	Header	Description
A	MemberID	Unique ID: ARKA_MEMBER_X
B	Email	Primary and Alternate Gmails (Comma-separated)
C	FullName	The "Signature" name displayed under the Bio
D	DisplayName	The primary handle/nickname used in the app
E	JoinDate	Date user registered: dd-MMM-yyyy
F	Country	User-provided location
G	ShortBio	Personal introduction text
H	LangSpoken	Languages and levels: English (Native), Spanish (B1)
I	LinkedIn	Full URL to the user's LinkedIn profile
J	Goodreads	Full URL to the user's Goodreads profile
K	FavGenre	Preferred book categories (Comma-separated)
L	ReadingGoal	Personal goal: Read 50 books this year
M	LastAccessed	Timestamp of last app open: dd-mm-yyyy hh:mm:ss Z
N	Badges	List of earned awards or "None"
O	TotalClubPoints	Numeric sum of all points earned from activities
P	TotalPages	Lifetime pages read (Cumulative)
Q	TotalBooks	Lifetime books finished (Cumulative)
R	ImageURL	Direct link to the Google Drive thumbnail for the avatar
		
PageLogDB	Page Tracker	
Column	Header	Description
A	LogID	Unique ID: ARKA_PLOG_X
B	Timestamp	dd-mm-yyyy hh:mm:ss Z
C	MemberID	ARKA_MEMBER_X
D	BookID	ARKA_BOOK_X
E	PagesDelta	The actual pages read in that specific session.
F	Source	ArkaClubApp or 10PagesADay
		
		
ArkaLibraryDB	(The Book Repository)	
Column	Header	Description
A	BookID	Unique ID: ARKA_BOOK_X
B	Title	The formal name of the book
C	Author	The writer's name
D	Genre	Primary genre/category
E	Pages	Total page count of the physical/digital book
F	AddedBy	MemberID of the person who first added the book
G	AddedDate	Simple date: dd-MMM-yyyy
H	LastModifiedDate	Timestamp of the last info update
I	LastModifiedBy	MemberID of the person who last edited the info
J	CoverURL	External link to the book cover image (Optional)
K	ISBN13	13-digit standard book identifier
L	PublishedDate	The year or date the book was released
M	Blurb	Short summary or description of the book
		
		
MemberShelfDB	(Personal Reading Progress)	
Column	Header	Description
A	ShelfID	Unique ID: ARKA_SHELF_X
B	MemberID	ARKA_MEMBER_X who owns this shelf record
C	BookID	ARKA_BOOK_X being tracked
D	Status	To Read, Reading, Finished, or Did Not Finish
E	Rating	Numeric rating from 1 to 5 (0 = Unrated)
F	Review	Text-based thoughts/thoughts shared by the member
G	DateAdded	When the book was first put on the shelf
H	DateUpdated	When the status or pages were last changed
I	DateFinished	The specific date the user finished the book
J	PagesRead	The current page number reached by the user
K	LastModifiedOn	Full technical timestamp: dd-mm-yyyy hh:mm:ss Z
		
		
ActivityLogDB	(The Social Feed Engine)	
Column	Header	Description
A	ActivityID	Unique ID: ARKA_ACT_X
B	ActivityTypeID	Code for action: ARKA_ACTTYP_BOOKREAD, etc.
C	ActivityDate	Timestamp: dd-mm-yyyy hh:mm:ss Z
D	MemberID	Who performed the action
E	Description	Extra context (BookID, ShelfID, or Level names)
F	Source	App version or external app name (e.g., 10PagesADay)
G	CPAwarded	Points granted for this specific action
		
FeedbackDB	(Internal Support)	
Column	Header	Description
A	Timestamp	dd-mm-yyyy hh:mm:ss Z
B	MemberID	ARKA_MEMBER_X
C	MemberName	DisplayName for quick reference
D	AppSource	Version of the app used during submission
E	Category	Bug or Feature
F	Section	Area of the app (e.g., Home Feed, Library)
G	Description	The actual feedback text
H	Status	Internal tracking: Open, In Progress, Resolved
		
		
ClubPointLevelDB	(The Progression Engine)	
Column	Header	Description
A	LevelNum	Sequential rank: 1, 2, 3...
B	MaxClubPoints	The "XP" cap for this level. Once exceeded, the user ranks up.
C	LevelName	The official title: Novice, Reader, Bookworm, Sage, etc.
		
		
ActivityTypeDB	(The Point Economy)	
Column	Header	Description
A	ActivityTypeID	The unique system code: ARKA_ACTTYP_BOOKREAD, ARKA_ACTTYP_FEEDBACK
B	ActivityType	Human-readable name: Finished a Book, Added to Library
C	ActivityDesc	Internal notes on what triggers this specific activity.
D	ActivityIntroDate	When this point rule was added to the system: dd-MMM-yyyy
E	ActivityClubPoints	The multiplier: 1, 5, 10, etc. (Points earned per action)
		
		
BookPostDB (Community Discussions)		
Column	Header	Description
A	BookPostID	Unique ID: ARKA_BOOKPOST_X
B	BookID	ARKA_BOOK_X — the book being discussed
C	MemberID	ARKA_MEMBER_X — the author of the post
D	Timestamp	dd-mm-yyyy hh:mm:ss Z
E	PostType	Category: General Note, Quote I Loved, Fan Cast
F	Content	The actual text content of the post (preserves line breaks)
G	Status	Active or Deleted
H	LikeCount	Numeric sum of likes received
