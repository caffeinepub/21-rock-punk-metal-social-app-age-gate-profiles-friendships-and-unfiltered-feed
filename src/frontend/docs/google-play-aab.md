# Building an Android App Bundle (AAB) for Google Play

This guide explains how to convert the MetalHead web app into an Android App Bundle (AAB) that can be published on Google Play using a Trusted Web Activity (TWA) approach.

## Prerequisites

- Node.js (v16 or higher)
- Java Development Kit (JDK) 11 or higher
- Android SDK command-line tools
- Your deployed MetalHead app URL

## Overview

A Trusted Web Activity (TWA) allows you to package your web app as an Android app. The app will open your website in a full-screen Chrome Custom Tab without any browser UI, making it feel like a native app.

## Step 1: Install Bubblewrap

Bubblewrap is a tool that simplifies creating TWA projects.

