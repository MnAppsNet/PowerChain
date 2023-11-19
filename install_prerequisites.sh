#Install GETH
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt update
sudo apt install ethereum
sudo apt install -y puppeth

#Add PowerChain scipts to PATH
#All PowerChain scripts start with "pc_"
sudo chmod +x scripts/*
if grep -q "$(pwd)/scripts" ~/.bashrc; then
  echo "PowerChain scripts already in PATH..."
else
  echo "export PATH=$(pwd)/scripts:\$PATH" >> ~/.bashrc
  export PATH=$(pwd)/scripts:$PATH
  echo "Adding PowerChain scripts to PATH..."
fi

#Install Python
sudo apt install python3

#Install Web3.py
pip install --upgrade web3 web3quorum py-solc-x

#Install node
sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE=16
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update
sudo apt install nodejs gcc g++ make -y
sudo npm cache clean -f
sudo npm install -g n
sudo n 16
sudo apt-get install --reinstall nodejs-legacy 

echo "- - - - -"
echo "Done..."