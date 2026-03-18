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
P	eventTimezone			
			
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
I	targetMemberId	ARKA_MEMBER_X, blank = club wide	


Activity Types :

ActivityTypeID	ActivityType	ActivityDesc	ActivityIntroDate	ActivityClubPoints	LogDescriptionFormat
▸  READING CORE					
ARKA_ACTTYP_PAGEREAD	Logged Pages	Logs an update to a member's daily page reading progress. Points = delta pages × 4. Only positive page deltas award points; corrections (lower page entry) award 0.	22-Feb-2026	+4	+<delta> pages added to <ShelfRecordID> | User Note: <note>
ARKA_ACTTYP_BOOKREAD	Finished Reading	Indicates a member has finished reading a book and updated their shelf status to 'Finished'.	22-Feb-2026	+300	<ShelfRecordID>
ARKA_ACTTYP_BOOKREADING	Shelved: Reading	Records when a member updates a book's status to 'Reading' on their shelf.	03-Mar-2026	+30	<ShelfRecordID>
ARKA_ACTTYP_BOOKTOREAD	Shelved: To Read	Records when a member updates a book's status to 'To Read' on their shelf.	01-Mar-2026	+10	<ShelfRecordID>
ARKA_ACTTYP_BOOKDNF	Shelved: DNF	Records when a member updates a book's status to 'Did Not Finish' (DNF) on their shelf.	02-Mar-2026	+10	<ShelfRecordID>
ARKA_ACTTYP_SHELFUPDATE	Updated Shelf	Records a general update to a member's personal shelf record (e.g. page position edit). Hidden from home feed. Used as an audit trail, not a primary activity.	25-Feb-2026	0	<ShelfRecordID>, Current Pages Read: <pages>
ARKA_ACTTYP_BOOKRATING	Rated a Book	Records when a member submits or updates a star rating for a book. Only awarded once per shelf record; duplicate rating updates generate no additional points.	22-Feb-2026	+60	<ShelfRecordID>
ARKA_ACTTYP_BOOKREVIEW	Reviewed a Book	Records when a member submits or updates a written review for a book. Only awarded once per shelf record; review edits do not re-award points.	22-Feb-2026	+250	<ShelfRecordID>
▸  LIBRARY					
ARKA_ACTTYP_BOOKADD	Added Book to Library	Logs the addition of a new book record to the central Arka Library database.	22-Feb-2026	+150	<BookID>
ARKA_ACTTYP_BOOKUPDATE	Fixed Book Details	Logs when a member updates the metadata (e.g. cover, page count, blurb) of an existing book in the library. Subject to a 30-day cooldown per book per member.	25-Feb-2026	+100	<BookID>
▸  COMMUNITY					
ARKA_ACTTYP_BOOKPOST	Posted Book Discussion	Records when a member adds a discussion post (General Note, Quote I Loved, or Fan Cast) on a book page. Typo fix: was ARKA_ACTTYPE_BOOKPOST.	13-Mar-2026	+50	<BookPostID>
ARKA_ACTTYP_WHATSAPP	WhatsApp Engagement	Logs when a member shares content to the club WhatsApp group via the in-app share button. Requires a dedicated share-button hook to fire — currently inactive until button is built.	22-Feb-2026	+5	<WhatsApp message preview>
▸  MEETINGS & EVENTS					
ARKA_ACTTYP_MEETINGATTENDED	Attended Club Meeting	Records a member's confirmed attendance at an official club meeting (Virtual or F2F). Logged by admin after the event via attendanceConfirmed in EventRSVPDB. Replaces the legacy ARKA_ACTTYP_MEETING type for all new events.	18-Mar-2026	+300	<EventID>
ARKA_ACTTYP_MEETINGHOSTED	Hosted Club Meeting	Records when a member hosts or leads an official club meeting. Set by admin; only one host per event. Awarded in addition to MEETINGATTENDED — hosts earn both attendance and hosting points.	18-Mar-2026	+600	<EventID>
ARKA_ACTTYP_EVENTATTENDED	Attended Club Event	Records a member's confirmed attendance at a non-meeting club event (Social, BookBuddyRead, Other). Lower reward than MEETINGATTENDED, reflecting the lighter scheduling commitment.	15-Mar-2026	+50	<EventID>
ARKA_ACTTYP_EVENTHOSTED	Hosted Club Event	Records when a member hosts a non-meeting club event (Social, BookBuddyRead, Other). Admin-set. Awarded in addition to EVENTATTENDED.	18-Mar-2026	+600	<EventID>
ARKA_ACTTYP_EVENTRSVP	RSVPed to Event	Records when a member RSVPs 'Yes' or 'Maybe' to any club event. 'No' RSVPs are filtered from the home feed and do not award points.	15-Mar-2026	+5	<RSVP_ID>
ARKA_ACTTYP_EVENTCREATED	Event Created	Logs when an admin or eligible member creates a new club event in the system.	15-Mar-2026	+10	<EventID>
ARKA_ACTTYP_EVENTCANCELLED	Event Cancelled	Admin-only log when a club event is cancelled. No points awarded. Hidden from home feed. Used for audit and notification purposes.	15-Mar-2026	0	<EventID>
ARKA_ACTTYP_BUDDYREAD_JOIN	Joined Buddy Read	Records when a member enrolls in a BookBuddyRead event. Awarded once per buddy read regardless of attendance confirmation.	18-Mar-2026	+75	<EventID>
ARKA_ACTTYP_BUDDYREAD_FINISH	Completed Buddy Read	Records when a member completes a buddy read (books fully read before the event deadline). Confirmed via shelf status = Finished and date ≤ event end date.	18-Mar-2026	+250	<EventID>
▸  CHALLENGES					
ARKA_ACTTYP_CHALLENGE_ENROLL	Enrolled in Challenge	Records when a member enrols in a club challenge. Points (enrollPoints) are set per-challenge in ChallengeDB col P, not by ActivityClubPoints here. ActivityClubPoints = 0 is intentional.	18-Mar-2026	0	<EnrollmentID> | enrollPoints: <pts>
ARKA_ACTTYP_CHALLENGE_FINISH	Finished a Challenge	Records when a member's enrollment status transitions to 'Finisher'. Points (finishPoints) are set per-challenge in ChallengeDB col Q. ActivityClubPoints = 0 is intentional; CPAwarded is injected at log time.	18-Mar-2026	0	<EnrollmentID> | finishPoints: <pts>
ARKA_ACTTYP_CHALLENGE_WIN	Won a Challenge	Records when a member's enrollment status transitions to 'Winner'. Points (winPoints) are set per-challenge in ChallengeDB col R. ActivityClubPoints = 0 is intentional; CPAwarded is injected at log time.	18-Mar-2026	0	<EnrollmentID> | winPoints: <pts>
ARKA_ACTTYP_CHALLENGE_DROP	Dropped a Challenge	Audit log when a member drops an active challenge enrollment. No points awarded or deducted. Provides MasterEngine and admin visibility into which challenges have high drop rates.	18-Mar-2026	0	<EnrollmentID>
▸  BADGES					
ARKA_ACTTYP_BADGEAWARD	Badge Awarded	Records when a badge is awarded to a member. CPAwarded is set to the badge's own point value at log time (from BadgeDB), overriding the ActivityClubPoints = 1 placeholder. ActivityClubPoints = 1 here is a legacy placeholder only.	14-Mar-2026	+1	<AwardID>
ARKA_ACTTYP_BADGEREVOKE	Badge Revoked	Records when a badge is revoked from a member. CPAwarded is negative, equal to the original badge points, effectively reversing the award.	14-Mar-2026	-1	<AwardID>
▸  PROFILE					
ARKA_ACTTYP_PROFILENEW	Joined the Club	Records the creation of a new member profile in the application. Fired once per member on registration.	22-Feb-2026	+1	<blank>
ARKA_ACTTYP_PROFILEUPDATE	Updated Profile	Logs when a member updates their personal profile information. Subject to a 1-per-day cooldown enforced by MasterEngine audit.	22-Feb-2026	+25	<profile fields changed>
ARKA_ACTTYP_FEEDBACK	Sent Feedback	Logs the submission of a bug report or feature request by a member via the in-app form.	06-Mar-2026	+150	Bug/Feature in <App Area>
▸  MILESTONES					
ARKA_ACTTYP_MEMBERLEVELUP	Leveled Up!	Logs when a member accumulates enough points to advance to the next user level. Written by MasterEngine. No points awarded — the level itself is the reward.	28-Feb-2026	0	Previous Level: <old> | New Level: <new>
ARKA_ACTTYP_MILESTONE_PAGES	Page Milestone	Records when a member surpasses a predefined lifetime page milestone (1K, 5K, 10K, 25K, 50K, 100K, 250K, 500K, 750K, 1M pages). CPAwarded is injected by MasterEngine based on the milestone tier. ActivityClubPoints = 0 is intentional.	07-Mar-2026	0	<milestone threshold pages> | <pts awarded>
ARKA_ACTTYP_MILESTONE_BOOKS	Book Milestone	Records when a member surpasses a predefined lifetime books-finished milestone (10, 25, 50, 100, 200, 500, 750, 1000 books). CPAwarded is injected by MasterEngine based on the milestone tier. ActivityClubPoints = 0 is intentional.	07-Mar-2026	0	<milestone threshold books> | <pts awarded>
▸  SYSTEM					
SYS_ACTTYP_CLUBPOINTS_UPDATE	System: Sync Points	System log indicating a background synchronisation of total Club Points to the MemberDB. Written by MasterEngine after recalculating the true point total. Hidden from home feed.	22-Feb-2026	0	<+/- delta> points synced to profile
SYS_ACTTYP_CLUBPOINTS_ADD	System: Add Points	System log indicating a manual or automated addition of bonus Club Points to a member's account by an admin. Hidden from home feed.	22-Feb-2026	0	<delta> points | Reason: <reason text>
SYS_ACTTYP_CLUBPOINTS_CORRECTION	System: Points Correction	Negative correction written by MasterEngine when an audit rule violation is detected (e.g. duplicate rating, profile update farming). CPAwarded is always negative.	12-Mar-2026	0	Reason: <rule violated> | Offset for: <ActivityID>
SYS_ACTTYP_BADGEAWARD	System: Award Badge	System log recording the automated assignment of a badge to a member's profile. Separate from ARKA_ACTTYP_BADGEAWARD (admin-initiated). Hidden from home feed.	22-Feb-2026	0	<BadgeID>
SYS_ACTTYP_TOTALPAGES_UPDATE	System: Sync Pages	System log indicating a background synchronisation of a member's total pages read to MemberDB. Written by MasterEngine. Hidden from home feed.	07-Mar-2026	0	<delta> pages synced to profile
SYS_ACTTYP_TOTALBOOKS_UPDATE	System: Sync Books	System log indicating a background synchronisation of a member's total books finished to MemberDB. Written by MasterEngine. Hidden from home feed.	07-Mar-2026	0	<delta> books synced to profile
SYS_ACTTYP_PAGEREAD	System: Page Read	A mechanism to add pages and award points directly (e.g. for data imports or corrections). CPAwarded is set directly in the log — the ActivityClubPoints multiplier is 0 because points are not calculated here.	07-Mar-2026	0	Reason: <reason text> | Points Awarded: <pts>
<img width="1373" height="3217" alt="image" src="https://github.com/user-attachments/assets/d82bb53e-6a9a-4e00-a736-a4eff752b868" />
