# Onigiri (Standalone version)

## What is Onigiri ?

Have you ever needed to join datasets from different data sources ?

Onigiri is **collaborative** web application that helps doing **data integration** on small datasets. Because it uses string comparison algorithms to apply fuzzy matching to your datasets, every case has to be dealt by hand : Onigiri just doesn't believe in false posititves/negatives.

## How does it work ?

## What is OnigiriStandalone version ?

This version of the app allows you to run Onigiri on a local machine or local server. By using it, _your data is safely kept in your servers_, collaborative matching is still an option.

## How do I install Onigiri Standalone version ?

#### Install the required tools

Install [NodeJS](https://nodejs.org/en/download/)
Install [Python3](https://www.python.org/downloads/)
Install [RabbitMQ](https://www.rabbitmq.com/download.html)

Before starting the installation, make sure RabbitMQ has started by running the following command:
> rabbitmq-server start

#### Install OnigiriStandalone

Open a terminal and clone the repo:
> git clone https://github.com/WilliamDiakite/onigiriStandalone.git

Enter the response
> cd onigiriStandalone

Make the bash scripts executable
> chmod +x install.sh
> chmod +x run.sh

Install and update Onigiri
> ./install.sh

Run Onigiri
> ./run.sh


## How to contribute to Onigiri's development ?
