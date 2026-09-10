This is an expo react-native skeleton.

It should become a personal-use productivity app tracking blocks (similar to pomodoro units, but not quite the same).

As a source of truth, it should use a *real folder on disk* (e.g. syncable w/ Syncthing). This is a non-negotiable feature. Check ../note/ for a similar implementation, albeit in flutter.

Add tailwind + lucide (icons) w/ appropriate libraries.
Use tailwind (in favor of manual CSS) whenever reasonable.
Use a minimalist (but not corporate) style. 
Keep it very clean, using minimal color varity, opacities, borders, shadows etc.Off-Black on white preferred.

## Model

We're going to have one folder on disk with one subfolder per model.
Each entity has one JSON file in this folder, with a slugged OS-safe filename based on its title/content/useful data.

### Project

A high-level project. Has a `title` and a `goals`[] prop. 

### Goals

A specific goal. Has `title` and `created` (timestamp, auto-added), and a `fulfilled`:bool.
`title` must be globally unique to prevent collisions in reverse lookup

### Block

One block of work, 25 minutes long.
has a `started` timestamp, and references to goal and block, saved as string (of title), not filename. Also a `isClean` bool.

## Screens

Have a simple nav bar on top to switch between top level pages: Main, Diary, Goals, Settings

### Main

Implement as clean state machine.

First state `unstarted`:
A text field to set the goal, as a string.
Has a smart dropdown string-matching saved projects and goals, showing this in the dropdown as "$project: $goal". Do NOT use ellipsis. Clicking on a dropdown goal obviously fills the input field. Note: It's possible to put an arbitrary goal string NOT matching with any persisted goal!

Below that, a button saying "I have visualized the goal". It needs to be pressed for 1s (fill-up animation), before changing into text "$checkmark-icon Goal Visualized" and showing below that a button "Start".

`started`:
A countdown timer. Make sure the timer is implemented properly, not some bespoke garbage that breaks. Make sure background running permissions, sound-player-permissions-in-background and all that stuff if active, just like a real fucking timer app, yes? 
On the screen, just show:
$goal
$minutes-left (big font, until 3 minutes left just show the minutes ("3m"), then show m:ss.
$abort-button (must be pressed for 0.3s (fill up animation), saves the block as `isClean` false, using toast for small notification, goes back to `unstarted`, but pre-filling the goal from last time)

When time is up, `evaluate`:
You worked on /n $goal
$toggle (binary toggle for "count"/"don't count", decides whether isClean true or not, if at all possible no default state, option must be selected (use some neat pattern, don't overengineer))
$buttons (two buttons, below each other "Do another" (back to `started` with same goal) and "Set new goal" (back to `unstarted`)

### Diary

A simple (simple!!) by-day overview of done blocks per calendar day. Visualize blocks as simple squares in their color. If not `isClean`, show an X icon instead of a square. On hover/tab, show the start and end time of day (not date!) in a human-readable format (not down to the second) as well as project and goal of the block .

### Goals

A list of the goals, grouped by projects.
Allow CRUD operations on either, using icon-only buttons and modals for editing.
Have a FAB opening a modal to add a new project.
Goals are always nested into projects.

### Settings

allow changing the folder on disk.
Automatically opened when folder not set.

## Guidelines

- *Internal app*. Do not add marketing waffling. Do not explain features. Do not add cute micro copy that's not needed or asked for.
- Do not add confirmation dialogs for delete actions. Instead, have a toast that allows undo. Hide toast after 20 seconds or after 2 tab/click/etc interactions with the app. Use recommended patterns.

## Extras

- Add a justfile to do stuff like dev, building apk, building and reinstalling on ubuntu/fedora (remember: the point of justfiles is to offer A FEW commands that offer core functions in ONE STEP, not 56365 separate ones)
- Calculate a "random" color for each block by hashing the used goal to a number used as the H of a HSV color value (hardcode S and V to reasonable values)
