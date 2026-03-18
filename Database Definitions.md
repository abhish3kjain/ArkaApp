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

ActivityTypeID	ActivityClubPoints	ActivityType	ActivityDescription	ActivityIntroDate	LogDescriptionFormat
ARKA_ACTTYP_WHATSAPP	5	Shared to WhatsApp	Fires when a member shares club content to the WhatsApp group via the in-app share button. Requires the share button to be wired to this log call — currently inactive until the button is built.	22-Feb-2026	Preview: <message text>
ARKA_ACTTYP_BOOKADD	150	Added Book to Library	Fires when a member adds a new book record to the Arka Library. Duplicate titles are blocked by the backend before this is logged.	22-Feb-2026	<BookID>
ARKA_ACTTYP_BOOKUPDATE	100	Updated Book Details	Fires when a member edits the metadata of an existing library book (e.g. cover, page count, blurb). Subject to a 30-day cooldown per book per member enforced by MasterEngine.	25-Feb-2026	<BookID>
ARKA_ACTTYP_BOOKREADING	30	Started Reading	Fires when a member sets a book's shelf status to Reading.	3-Mar-2026	<ShelfRecordID>
ARKA_ACTTYP_BOOKREAD	300	Finished a Book	Fires when a member sets a book's shelf status to Finished.	22-Feb-2026	<ShelfRecordID>
ARKA_ACTTYP_BOOKTOREAD	10	Added to To Read	Fires when a member sets a book's shelf status to To Read.	1-Mar-2026	<ShelfRecordID>
ARKA_ACTTYP_BOOKDNF	10	Marked Did Not Finish	Fires when a member sets a book's shelf status to Did Not Finish (DNF).	2-Mar-2026	<ShelfRecordID>
ARKA_ACTTYP_SHELFUPDATE	0	Updated Shelf Record	Fires when a member edits an existing shelf record without changing its status (e.g. correcting a page position). Hidden from the home feed. Used as an audit trail.	25-Feb-2026	<ShelfRecordID> | Pages: <newPagesRead>
ARKA_ACTTYP_PAGEREAD	4	Logged Pages	Fires when a member logs a reading session. Points = positive page delta × 4. Zero points are awarded if the new page count is lower than the previous (correction entries).	22-Feb-2026	+<deltaPges> pages | ShelfID: <ShelfRecordID> | Note: <userNote>
ARKA_ACTTYP_BOOKRATING	60	Rated a Book	Fires when a member submits or changes a star rating on a finished book. MasterEngine deduplicates — only one rating award per shelf record is retained.	22-Feb-2026	<ShelfRecordID>
ARKA_ACTTYP_BOOKREVIEW	250	Reviewed a Book	Fires when a member writes or edits a text review on a finished book. MasterEngine deduplicates — only one review award per shelf record is retained.	22-Feb-2026	<ShelfRecordID>
SYS_ACTTYP_CLUBPOINTS_UPDATE	0	System: Sync Club Points	Written by MasterEngine after recalculating a member's true point total and syncing it to MemberDB. Hidden from home feed.	22-Feb-2026	Delta: <+/- points> synced to profile
SYS_ACTTYP_CLUBPOINTS_ADD	0	System: Add Bonus Points	Written when an admin manually credits bonus points to a member's account outside the normal activity flow.	22-Feb-2026	Points: <delta> | Reason: <reasonText>
SYS_ACTTYP_BADGEAWARD	0	System: Auto-Award Badge	Written by MasterEngine when a badge is assigned automatically based on a rule (e.g. milestone, streak). Distinct from ARKA_ACTTYP_BADGEAWARD which is admin-initiated.	22-Feb-2026	<BadgeID>
ARKA_ACTTYP_PROFILEUPDATE	25	Updated Profile	Fires when a member saves changes to their profile (bio, languages, social links, etc.). One point-earning update per day enforced by MasterEngine audit.	22-Feb-2026	Fields changed: <changedFields>
ARKA_ACTTYP_PROFILENEW	1	Joined the Club	Fires once when a new member completes registration and their profile is created.	22-Feb-2026	—
ARKA_ACTTYP_MEMBERLEVELUP	0	Levelled Up	Fires when a member crosses a level threshold. No points awarded — the level itself is the reward. Written immediately after the point sync that caused the level change.	28-Feb-2026	From: <previousLevelName> | To: <newLevelName>
ARKA_ACTTYP_FEEDBACK	150	Submitted Feedback	Fires when a member submits a bug report or feature suggestion via the in-app feedback form.	6-Mar-2026	Type: <Bug/Feature> | Area: <appSection>
SYS_ACTTYP_TOTALPAGES_UPDATE	0	System: Sync Total Pages	Written by MasterEngine after syncing a member's cumulative page count to MemberDB. Hidden from home feed.	7-Mar-2026	Delta: <+/- pages> synced to profile
SYS_ACTTYP_TOTALBOOKS_UPDATE	0	System: Sync Total Books	Written by MasterEngine after syncing a member's cumulative finished-book count to MemberDB. Hidden from home feed.	7-Mar-2026	Delta: <+/- books> synced to profile
SYS_ACTTYP_PAGEREAD	0	System: Add Pages	Admin or system mechanism to credit pages and points directly (e.g. data imports, manual corrections). CPAwarded is written directly to the log — the multiplier is 0 and is not used.	7-Mar-2026	Reason: <reasonText> | Points Awarded: <cpAwarded>
ARKA_ACTTYP_MILESTONE_PAGES	0	Page Milestone Reached	Fires when a member's lifetime page count crosses a predefined milestone threshold. CPAwarded is injected by MasterEngine based on the tier — the multiplier here is not used.	7-Mar-2026	Milestone: <thresholdPages> pages | Points: <cpAwarded>
ARKA_ACTTYP_MILESTONE_BOOKS	0	Book Milestone Reached	Fires when a member's lifetime finished-book count crosses a predefined milestone threshold. CPAwarded is injected by MasterEngine based on the tier — the multiplier here is not used.	7-Mar-2026	Milestone: <thresholdBooks> books | Points: <cpAwarded>
SYS_ACTTYP_CLUBPOINTS_CORRECTION	0	System: Points Correction	Negative correction written by MasterEngine when an audit rule violation is detected (e.g. duplicate rating, same-day profile update spam). CPAwarded is always negative.	12-Mar-2026	Reason: <ruleViolated> | Offsetting: <ActivityID>
ARKA_ACTTYP_BOOKPOST	50	Posted Book Discussion	Fires when a member publishes a discussion post (General Note, Quote I Loved, or Fan Cast) on a book's detail page.	13-Mar-2026	<BookPostID>
ARKA_ACTTYP_BADGEAWARD	1	Badge Awarded	Fires when an admin manually awards a badge to a member. CPAwarded is set at log time to the badge's own point value from BadgeDB — the multiplier of 1 here is a placeholder only.	14-Mar-2026	<AwardID>
ARKA_ACTTYP_BADGEREVOKE	-1	Badge Revoked	Fires when an admin revokes a badge from a member. CPAwarded is set at log time to the negative of the original badge point value, reversing the award.	14-Mar-2026	<AwardID>
ARKA_ACTTYP_EVENTCREATED	10	Created an Event	Fires when an admin or eligible member creates a new event in the system.	15-Mar-2026	<EventID>
ARKA_ACTTYP_EVENTRSVP	5	RSVPed to Event	Fires when a member RSVPs Yes or Maybe to an event. No points are awarded for No responses. Hidden from feed when RSVP status is later updated to No.	15-Mar-2026	<RSVP_ID>
ARKA_ACTTYP_EVENTATTENDED	0	Attended Event	Fires when admin confirms a member's attendance at a club event. CPAwarded is injected at log time from a hardcoded map keyed on eventType and host status — the multiplier of 0 here is intentional.	15-Mar-2026	<EventID> | Type: <eventType> | Host: <true/false> | Points: <cpAwarded>
ARKA_ACTTYP_EVENTCANCELLED	0	Event Cancelled	Fires when an admin cancels a club event. No points awarded. Hidden from home feed. Used for audit and notification purposes only.	15-Mar-2026	<EventID>
ARKA_ACTTYP_EVENTHOSTED	0	Hosted Event	Fires alongside EVENTATTENDED when the attending member is the confirmed host. CPAwarded is injected from the same hardcoded host map — the multiplier of 0 here is intentional.	18-Mar-2026	<EventID> | Type: <eventType> | Points: <cpAwarded>
ARKA_ACTTYP_ANNOUNCEMENTPOSTED	0	Announcement Posted	Fires when an admin publishes a club-wide announcement. No points awarded. Hidden from home feed.	15-Mar-2026	<AnnouncementID>
ARKA_ACTTYP_CHALLENGE_ENROLL	0	Enrolled in Challenge	Fires when a member enrols in a club challenge. Points are set per-challenge via ChallengeDB.enrollPoints and injected at log time — the multiplier of 0 here is intentional.	16-Mar-2026	<EnrollmentID> | Points: <enrollPoints>
ARKA_ACTTYP_CHALLENGE_FINISH	0	Finished a Challenge	Fires when a member's enrollment status transitions to Finisher. Points are set per-challenge via ChallengeDB.finishPoints and injected at log time — the multiplier of 0 here is intentional.	16-Mar-2026	<EnrollmentID> | Points: <finishPoints>
ARKA_ACTTYP_CHALLENGE_WIN	0	Won a Challenge	Fires when a member's enrollment status transitions to Winner. Points are set per-challenge via ChallengeDB.winPoints and injected at log time — the multiplier of 0 here is intentional.	16-Mar-2026	<EnrollmentID> | Points: <winPoints>
ARKA_ACTTYP_CHALLENGE_DROP	0	Dropped a Challenge	Fires when a member withdraws from an active challenge enrollment. No points awarded or deducted. Preserved for audit and admin reporting on challenge drop rates.	18-Mar-2026	<EnrollmentID><delta> books synced to profile
SYS_ACTTYP_PAGEREAD	System: Page Read	A mechanism to add pages and award points directly (e.g. for data imports or corrections). CPAwarded is set directly in the log — the ActivityClubPoints multiplier is 0 because points are not calculated here.	07-Mar-2026	0	Reason: <reason text> | Points Awarded: <pts>

Club Points Levels:
Level	TotalClubPoints	LevelName
1	111	Page Turner I
2	248	Page Turner II
3	417	Page Turner III
4	624	Page Turner IV
5	875	Page Turner V
6	1176	Page Turner VI
7	1533	Page Turner VII
8	1952	Page Turner VIII
9	2439	Page Turner IX
10	3000	Page Turner X
11	3641	Bookworm I
12	4368	Bookworm II
13	5187	Bookworm III
14	6104	Bookworm IV
15	7125	Bookworm V
16	8256	Bookworm VI
17	9503	Bookworm VII
18	10872	Bookworm VIII
19	12369	Bookworm IX
20	14000	Bookworm X
21	15771	Scholar I
22	17688	Scholar II
23	19757	Scholar III
24	21984	Scholar IV
25	24375	Scholar V
26	26936	Scholar VI
27	29673	Scholar VII
28	32592	Scholar VIII
29	35699	Scholar IX
30	39000	Scholar X
31	42501	Bibliophile I
32	46208	Bibliophile II
33	50127	Bibliophile III
34	54264	Bibliophile IV
35	58625	Bibliophile V
36	63216	Bibliophile VI
37	68043	Bibliophile VII
38	73112	Bibliophile VIII
39	78429	Bibliophile IX
40	84000	Bibliophile X
41	89831	Scribe I
42	95928	Scribe II
43	102297	Scribe III
44	108944	Scribe IV
45	115875	Scribe V
46	123096	Scribe VI
47	130613	Scribe VII
48	138432	Scribe VIII
49	146559	Scribe IX
50	155000	Scribe X
51	163761	Sage I
52	172848	Sage II
53	182267	Sage III
54	192024	Sage IV
55	202125	Sage V
56	212576	Sage VI
57	223383	Sage VII
58	234552	Sage VIII
59	246089	Sage IX
60	258000	Sage X
61	270291	Luminary I
62	282968	Luminary II
63	296037	Luminary III
64	309504	Luminary IV
65	323375	Luminary V
66	337656	Luminary VI
67	352353	Luminary VII
68	367472	Luminary VIII
69	383019	Luminary IX
70	399000	Luminary X
71	415421	Maven I
72	432288	Maven II
73	449607	Maven III
74	467384	Maven IV
75	485625	Maven V
76	504336	Maven VI
77	523523	Maven VII
78	543192	Maven VIII
79	563349	Maven IX
80	584000	Maven X
81	605151	Virtuoso I
82	626808	Virtuoso II
83	648977	Virtuoso III
84	671664	Virtuoso IV
85	694875	Virtuoso V
86	718616	Virtuoso VI
87	742893	Virtuoso VII
88	767712	Virtuoso VIII
89	793079	Virtuoso IX
90	819000	Virtuoso X
91	845481	Oracle I
92	872528	Oracle II
93	900147	Oracle III
94	928344	Oracle IV
95	957125	Oracle V
96	986496	Oracle VI
97	1016463	Oracle VII
98	1047032	Oracle VIII
99	1078209	Oracle IX
100	1110000	Oracle X
