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


BadgeAwardDB columns:		
Column	Header	Description
A	AwardID	ARKA_AWARD_1
B	BadgeID	ARKA_BADGE_1
C	MemberID	ARKA_MEMBER_5
D	AwardedBy	ARKA_MEMBER_1
E	AwardedDate	dd-mmm-yyyy
F	Status	Active / Revoked
G	Notes	Optional admin note


EventDB			
Col	Field	ID Format / Values	Notes
A	eventId	ARKA_EVENT_1	Primary key
B	eventType	Meeting-Virtual, Meeting-F2F, BookBuddyRead, Social, Other	Drives icon + badge colour
C	title	string	Display name
D	description	string	Full details, can be long
E	hostMemberId	ARKA_MEMBER_X or blank	Optional — not all events have a host
F	startDate	dd-MMM-yyyy	
G	startTime	HH:mm	24hr format
H	endDate	dd-MMM-yyyy	Can equal startDate
I	endTime	HH:mm	24hr format
J	meetingLink	URL or blank	Zoom/Meet link if virtual
K	assetsJson	JSON string	[{"type":"Photo","title":"...","link":"..."}] — consolidated, no extra sheet
L	status	Active, Cancelled, Completed	
M	isPinned	TRUE / FALSE	Pin to top of Events list
N	createdBy	ARKA_MEMBER_X	Admin who created it
O	createdOn	dd-MM-yyyy HH:mm:ss Z	
			
EventRSVPDB			
Col	Field	ID Format / Values	Notes
A	rsvpId	ARKA_RSVP_1	Primary key
B	eventId	ARKA_EVENT_X	FK → EventDB
C	memberId	ARKA_MEMBER_X	FK → MemberDB
D	rsvpStatus	Yes, No, Maybe	Member's own response; Invited is new — means added by someone else, member hasn't responded yet
E	rsvpDate	dd-MM-yyyy HH:mm:ss Z	Date of RSVP or invitation
F	attendanceConfirmed	Invited, Yes, No, blank	Admin-set post-event
G	confirmedBy	ARKA_MEMBER_X or blank	Which admin confirmed
H	confirmedOn	timestamp or blank	When admin confirmed
I	addedBy	ARKA_MEMBER_X	New — who created this row. Self = member RSVPed themselves. Otherwise = admin/host/creator pre-added them
			
AnnouncementDB			
Col	Field	ID Format / Values	Notes
A	announcementId	ARKA_ANN_1	Primary key
B	title	string	Short headline
C	body	string	Full text, can have line breaks
D	isPinned	TRUE / FALSE	Pinned always shows, un-pinned disappears after expiry
E	expiryDate	dd-MMM-yyyy or blank	Blank = never expires
F	status	Active, Archived	Archived = hidden from feed
G	createdBy	ARKA_MEMBER_X	
H	createdOn	dd-MM-yyyy HH:mm:ss Z	


Activity Types :

ActivityTypeID	ActivityType	ActivityDescription	ActivityIntroDate	ActivityClubPoints	LogDescriptionFormat
ARKA_ACTTYP_YEAR_BADGE_WIN	Yearly Badge Winner	Records when a member is awarded a Winner Badge for completing a yearly reading challenge.	22-Feb-2026	5000	BadgeID or ChallengeName
ARKA_ACTTYP_YEAR_BADGE_FINISH	Yearly Badge Finisher	Records when a member is awarded a Finisher Badge for a yearly challenge.	22-Feb-2026	1500	BadgeID or ChallengeName
ARKA_ACTTYP_YEAR_BADGE_CHALLENGE	Yearly Badge Challenger	Logs a member's registration or participation in a new yearly reading challenge	22-Feb-2026	300	BadgeID or ChallengeName
ARKA_ACTTYP_WHATSAPP	WhatsApp Engagement	When a member shares message or content on WhatsApp.	22-Feb-2026	5	WhatsApp Message
ARKA_ACTTYP_MEETING	Attended Club Meetup	Records a member's attendance at an official club meeting or call.	22-Feb-2026	300	MeetingID or Date
ARKA_ACTTYP_HOST	Hosted Club Meetup	Records when a member hosts or leads a club meeting or call.	22-Feb-2026	0	MeetingID or Date
ARKA_ACTTYP_BOOKADDED	Added Book to Library	Logs the addition of a new book record to the central Arka Library database.	22-Feb-2026	150	BookID
ARKA_ACTTYP_BOOKSHELVED	Added to Shelf	Records when a member adds a book to their personal reading shelf.	25-Feb-2026	50	ShelfRecordID
ARKA_ACTTYP_BOOKREAD	Finished Reading	Indicates a member has finished reading a book and updated their shelf status to 'Finished'.	22-Feb-2026	300	ShelfRecordID
ARKA_ACTTYP_BOOKUPDATE	Fixed Book Details	Logs when a member updates the metadata (e.g., cover, page count) of an existing book in the library.	25-Feb-2026	100	BookID
ARKA_ACTTYP_SHELFUPDATE	Updated Shelf	Records a general update to a member's personal shelf record	25-Feb-2026	30	ShelfRecordID
ARKA_ACTTYP_PAGEREAD	Logged Pages	Logs an update to a member's daily page reading progress.	22-Feb-2026	4	delta Pages, ShelfRecordID if linked to book
ARKA_ACTTYP_BOOKRATING	Rated a Book	Records when a member submits or updates a star rating for a book.	22-Feb-2026	50	ShelfRecordID
ARKA_ACTTYP_BOOKREVIEW	Reviewed a Book	Records when a member submits or updates a written review for a book.	22-Feb-2026	150	ShelfRecordID
SYS_ACTTYP_CLUBPOINTS_UPDATE	System: Update Points	System log indicating a background synchronization of total Club Points to the Member database.	22-Feb-2026	0	<delta> points synced to profile.
SYS_ACTTYP_CLUBPOINTS_ADD	System: Add Points	System log indicating a manual or automated addition of bonus Club Points to a member's account.	22-Feb-2026	0	<delta> points, reason text
SYS_ACTTYP_BADGEAWARD	System: Award Badge	System log recording the automated assignment of a badge to a member's profile.	22-Feb-2026	0	BadgeID
ARKA_ACTTYP_PROFILEUPDATE	Updated Profile	Logs when a member updates their personal profile information.	22-Feb-2026	30	Profile Content? - to be implemented in code
ARKA_ACTTYP_PROFILENEW	Joined the Club	Records the creation of a new member profile in the application.	22-Feb-2026	1	
ARKA_ACTTYP_MEMBERLEVELUP	Leveled Up!	Logs when a member accumulates enough points to advance to the next user level.	28-Feb-2026	0	Previous Level: [Old] | New Level: [New]
ARKA_ACTTYP_BOOKTOREAD	Shelved: To Read	Records when a member updates a book's status to 'To Read' on their shelf.	1-Mar-2026	10	ShelfRecordID
ARKA_ACTTYP_BOOKDNF	Shelved: DNF	Records when a member updates a book's status to 'Did Not Finish' (DNF) on their shelf.	2-Mar-2026	10	ShelfRecordID
ARKA_ACTTYP_BOOKREADING	Shelved: Reading	Records when a member updates a book's status to 'Reading' on their shelf.	3-Mar-2026	30	ShelfRecordID
ARKA_ACTTYP_FEEDBACK	Sent Feedback	Logs the submission of a bug report or feature request by a member.	6-Mar-2026	150	Bug/Feature in <App Area>
SYS_ACTTYP_TOTALPAGES_UPDATE	System: Sync Pages	System log indicating a background synchronization of a member's total pages read.	7-Mar-2026	0	<delta> pages synced to profile.
SYS_ACTTYP_TOTALBOOKS_UPDATE	System: Sync Books	System log indicating a background synchronization of a member's total books finished.	7-Mar-2026	0	<delta> books synced to profile.
SYS_ACTTYP_PAGEREAD	Page Read added by System 	A mechanism to add pages and award points. The details of activity should contain the reason of the update done via system. Club points are directly awarded in the log and not calculated here. Hence the multiplier is 0.	7-Mar-2026	0	Reason Text, Points Awarded
ARKA_ACTTYP_MILESTONE_PAGES	Page Milestone	Records when a member surpasses a predefined milestone for total pages read.	7-Mar-2026	0	
ARKA_ACTTYP_MILESTONE_BOOKS	Book Milestone	Records when a member surpasses a predefined milestone for total books finished.	7-Mar-2026	0	
SYS_ACTTYP_CLUBPOINTS_CORRECTION	System corrected points	Points are corrected for multiple activities awarded with points	12-Mar-2026	0	Reason Text, ActivityID for which point is offseted.
ARKA_ACTTYPE_BOOKPOST	Post Discussion on a book	Records when a member adds to disucssion on a book	13-Mar-2026	20	BookPostID
ARKA_ACTTYP_BADGEAWARD	Badge Awarded to a Member	Records when a badge is awarded to a member.	14-Mar-2026	1	AwardID
ARKA_ACTTYP_BADGEREVOKE	Badge Revoked from a Member	Records when a badge is revoked from a member.	14-Mar-2026	-1	AwardID
