# Getting Started AP Tracker

This project is for use with the Multi-world game randomizer [Archipelago](https://archipelago.gg) to help players keep track of which locations they have collected within their games and hopefully organize a potentially large list of checks into something more easy to manage.

There is a version of this tracker hosted at [https://drawesome4333.github.io/ap-tracker/](https://drawesome4333.github.io/ap-tracker/) for use with most games. The version hosted there cannot connect to not secured remote servers due to browser protections. You can get around this by hosting the project yourself by following the instructions in the [Running Locally section](#running-locally)


## Running Locally

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
> $ `npm run start`
6. The app should start compiling (it may take a minute). When it is finished you should see something saying the development server has started. Navigate to [http://localhost:3000](http://localhost:3000) to use the app and enjoy.


# Attributions

## Archipelago Logo
The Archipelago Logos used by this app are the modified works of Krista Corkos and Christopher Wilson (© 2022) and is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/