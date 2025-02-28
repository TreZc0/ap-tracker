# Getting Started AP Tracker

This project is for use with the Multi-world game randomizer [Archipelago](https://archipelago.gg) to help players keep track of which locations they have collected within their games and hopefully organize a potentially large list of checks into something more easy to manage.

There is a version of this tracker hosted at [https://drawesome4333.github.io/ap-tracker/](https://drawesome4333.github.io/ap-tracker/) for use with most games. The version hosted there cannot connect to not secured remote servers due to browser protections. You can get around this by following the instructions in the [Running Locally section](#running-locally)

## App features
- Connect to any Archipelago Game and get a checklist to help keep you organized by hiding checks you don't need to see
- Automatically groups checks based on location groups
- Allows for custom definitions, see [The Custom Tracker guide](./docs/customTrackers.md) for how to get this set up
- Mark checks as ignored or star them as important so you know to come back
- Remember where hinted locations are with automatic flags
- Sync a short memo with the server with the built-in note pad, can be accessed any time, even from another device
- Inventory Viewing
    - Easily see where items have come from, and mark any local ones of interest on the checklist. Should be useful for games that treat local items differently.
    - Filter the view based on item class (e.g. only progression and useful items)
    - Sort your inventory by time received, alphabetically, or the number of items of that type.

## Running Locally
1. Head to the releases page for the tracker [https://github.com/DrAwesome4333/ap-tracker/releases](https://github.com/DrAwesome4333/ap-tracker/releases) and download `ap-tracker-vX.X.X.zip`.

2. Extract the contents of the zip file to a local directory and open it up.

3. Open `index.html` in a web browser. The app should now be ready to go to connect to any AP server.

## Developing

### What you will need:
 - git, [https://git-scm.com/](https://git-scm.com/)
 - Node js version >=22.13.0, [https://nodejs.org/en](https://nodejs.org/en)

After downloading and installing these you should have everything you need to host the application.

### Installing the app:

1. Create a new folder to install the app in on your computer
2. Open a command terminal within that folder and run the following command (note that $ represents your terminal and is not a part of the command)
> $ `git clone https://github.com/DrAwesome4333/ap-tracker.git`
3. When git is done, there should now be a folder called `ap-tracker`, run the following command to enter it:
> $ `cd ./ap-tracker`
4. Now it is time to install the app's dependencies, run the command:
> $ `npm install`
5. After everything is installed it is time to compile and run the app. Run the command:
> $ `npm run dev`
6. The app should start compiling (it may take a minute). When it is finished you should see something saying the development server has started. Navigate to [http://localhost:3000](http://localhost:3000) to use the app and enjoy.


# Attributions

## Archipelago Logo
The Archipelago Logos used by this app are the modified works of Krista Corkos and Christopher Wilson (© 2022) and is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/