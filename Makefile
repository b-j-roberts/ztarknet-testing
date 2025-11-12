# Madara Devnet Management Makefile

# Configuration
CONTAINER_NAME := madara-devnet
IMAGE := ghcr.io/madara-alliance/madara:latest
NODE_NAME := Ztarknet
CHAIN_ID := ZTARKNET
RPC_PORT := 9944
DB_PATH := $(PWD)/.db

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help pull start stop restart logs logs-follow status clean clean-all health shell

help: ## Show this help message
	@echo "$(GREEN)Madara Devnet Management$(NC)"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

pull: ## Pull the latest Madara Docker image
	@echo "$(GREEN)Pulling Madara image...$(NC)"
	docker pull $(IMAGE)

start: ## Start the Madara devnet
	@echo "$(GREEN)Starting Madara devnet...$(NC)"
	@docker run -d \
		-p $(RPC_PORT):$(RPC_PORT) \
		-v $(DB_PATH):/tmp/madara \
		--name $(CONTAINER_NAME) \
		$(IMAGE) \
		--name $(NODE_NAME) \
		--devnet \
		--base-path /tmp/madara \
		--rpc-external \
		--rpc-cors all \
		--chain-config-override=chain_id=$(CHAIN_ID)
	@echo "$(GREEN)Devnet started!$(NC) Use 'make logs' to view output"
	@sleep 2
	@make status

stop: ## Stop the Madara devnet
	@echo "$(YELLOW)Stopping Madara devnet...$(NC)"
	docker stop $(CONTAINER_NAME) || true

restart: stop clean start ## Restart the devnet (stops, cleans container, starts fresh)

logs: ## Show recent logs (last 100 lines)
	docker logs --tail 100 $(CONTAINER_NAME)

logs-follow: ## Follow logs in real-time
	docker logs -f $(CONTAINER_NAME)

status: ## Check devnet status
	@echo "$(GREEN)Container Status:$(NC)"
	@docker ps -a --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "$(RED)Container not found$(NC)"

health: ## Check if RPC endpoint is responding
	@echo "$(GREEN)Checking RPC health...$(NC)"
	@curl -s -X POST http://localhost:$(RPC_PORT) \
		-H "Content-Type: application/json" \
		-d '{"jsonrpc":"2.0","method":"starknet_chainId","params":[],"id":1}' \
		| jq '.' || echo "$(RED)RPC not responding$(NC)"

clean: ## Remove the devnet container (keeps database)
	@echo "$(YELLOW)Removing container...$(NC)"
	docker rm -f $(CONTAINER_NAME) || true

clean-all: clean ## Remove container AND database
	@echo "$(RED)Removing container and database...$(NC)"
	rm -rf $(DB_PATH)
	@echo "$(GREEN)Cleanup complete$(NC)"

shell: ## Open a shell in the running container
	docker exec -it $(CONTAINER_NAME) /bin/sh

accounts: ## Show predeployed devnet accounts from logs
	@echo "$(GREEN)Predeployed Accounts:$(NC)"
	@docker logs $(CONTAINER_NAME) 2>&1 | grep -A 50 "DEVNET PREDEPLOYED CONTRACTS" || echo "$(YELLOW)Start the devnet first with 'make start'$(NC)"

# Quick access commands
up: start ## Alias for start
down: stop ## Alias for stop
ps: status ## Alias for status
