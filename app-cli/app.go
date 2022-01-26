package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Azure/azure-sdk-for-go/services/resources/mgmt/2019-05-01/resources"
	"github.com/Azure/go-autorest/autorest"
	"github.com/Azure/go-autorest/autorest/azure/auth"
	"github.com/joho/godotenv"
)

func main() {
	// Empty context, everything is sequential here
	ctx := context.Background()
	// Fetch required variables from env
	config := loadConfig()
	// We first have to create a service principal with the command
	// az ad sp create-for-rbac --name demo-bbl-secu-sp --role Reader
	// and fill the required values to authenticate
	authorizer, err := auth.NewAuthorizerFromEnvironment()
	if err != nil {
		log.Fatal("Couldn't authenticate to Azure. Aborting")
		os.Exit(-1)
	}
	// We can then fetch actual data...
	rgsIter := getAllResourcesGroupsInSub(ctx, config.subId, authorizer)

	//...And pretty print it
	const ROW_PATTERN = "%s\t\t%s\n"
	const MAX_COLUMN_WIDTH = 15
	fmt.Printf(ROW_PATTERN, setColumnWidth("Name", MAX_COLUMN_WIDTH), "Location")
	for rgsIter.NotDone() {
		fmt.Printf(ROW_PATTERN, setColumnWidth(*(rgsIter.Value().Name), MAX_COLUMN_WIDTH), *(rgsIter.Value().Location))
		rgsIter.NextWithContext(ctx)
	}
}

func setColumnWidth(s string, max int) string {
	const TAB_LEN = 8
	// Add tabs for shorter strings to preserve alignment
	// May not work if (max-len(s)) % 4 == 0
	// but hey, this is a demo script not a library
	if len(s) < max {
		for i := len(s); i < max; i += TAB_LEN {
			s = s + "\t"
		}
		return s
	}
	// The ellipsis length is 3 chars, won't be enough to provoke a misalignment
	return s[:max] + "..."
}

type config struct {
	appId       string
	appPassword string
	tenantId    string
	subId       string
}

// Fetch all the required env vars, die if any of them aren't defined
func loadConfig() config {
	err := godotenv.Load("./config/.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	appId, appPassword, tenantId, subId := os.Getenv("AZURE_CLIENT_ID"), os.Getenv("AZURE_CLIENT_SECRET"), os.Getenv("AZURE_TENANT_ID"), os.Getenv("AZURE_SUBSCRIPTION_ID")
	if len(appId) == 0 || len(appPassword) == 0 || len(tenantId) == 0 || len(subId) == 0 {
		log.Fatal("Required env vars missing, aborting.")
		os.Exit(-1)
	}
	return config{
		appId:       appId,
		appPassword: appPassword,
		tenantId:    tenantId,
		subId:       subId,
	}
}

// Call the Azure API to retrieve all resources groups in the given subscription
func getAllResourcesGroupsInSub(ctx context.Context, subId string, authorizer autorest.Authorizer) resources.GroupListResultIterator {
	groupsClient := resources.NewGroupsClient(subId)
	groupsClient.Authorizer = authorizer
	rgs, err := groupsClient.ListComplete(ctx, "", nil)
	if err != nil {
		log.Fatal("Couldn't retrieve any resources groups")
		os.Exit(-1)
	}
	return rgs
}
