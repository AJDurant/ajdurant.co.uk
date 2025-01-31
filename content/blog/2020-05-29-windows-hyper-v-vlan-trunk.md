---
layout: post
title: Windows Hyper-V VLAN Trunking
date: 2020-05-29
tags:
    - windows
    - powershell
    - virtual machine
    - hyper-v
aliases:
    - /posts/2020-05-29-windows-hyper-v-vlan-trunk
---

I've been struggling for a while to get a working network in my virtual lab. My basic setup is:
* Hyper-V as hypervisor
* pfsense as router/firewall with:
  * External network (bridge) for WAN
  * Internal network (to Hyper-V Host) for LAN, in order to access the web configurator
  * Private network for lab, for other VMs to connect to
* VLANs on the private network to separate VM networking and replicate real life networks

I want to use a single network with multiple VLANs, as it replicates the real life network. Initially this did not seem very possible with hyper-v as it only provides a single VLAN configuration in the GUI, this is equivalent to an *access port* on a real switch, when traffic from the port is tagged by the switch to the specified VLAN, and the attached device knows nothing about it.

However, through PowerShell configuration you can create *trunk ports* which are able to pass multiple VLANs, leaving the tagging to the OS of the guest system. This is done through the [`Set-VMNetworkAdaptorVlan`](https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vmnetworkadaptervlan) cmdlet. If you have a single network adaptor for your VM, or named your network adaptors then this is really easy to use. If not, then you need to do some selection to configure the correct adaptor. One other thing to note is that the input for `Set-VMNetworkAdapterVlan` is the output from [`Get-VMNetworkAdapter`](https://docs.microsoft.com/en-us/powershell/module/hyper-v/get-vmnetworkadapter) not `Get-VMNetworkAdapterVlan`. These commands all require an elevated PowerShell

```powershell
# Single net adaptor in VM
Get-VMNetworkAdapter -VMName lab-guest | Set-VMNetworkAdapterVlan -Trunk -AllowedVlanIDList "10,20,30" -NativeVlanId 0

# Uniquely named net adaptor in VM
Set-VMNetworkAdaptervlan -VMName lab-guest -VMNetworkAdapterName "Eth0"-Trunk -AllowedVlanIdList "10,20,30" -NativeVlanId 0

# Non-uniquely named adaptor
Get-VMNetworkAdapter -VMName lab-guest | Where-Object {$_.MacAddress -eq '00155D23930D'} | Set-VMNetworkAdapterVlan -Trunk -AllowedVlanIdList "10,20,30" -NativeVlanId 0
```

Initially I was trying to set it like this:
```powershell
Get-VMNetworkAdapter -VMName lab-guest | Set-VMNetworkAdapterVlan -Trunk -AllowedVlanIDList 1-100 -NativeVlanId 10
```
Using the 10 VLAN in the guest system, but it was not working at all and I don't know why. Setting the native to 0 seemed to fix it. I only worked this out after reading [this blog post](https://blog.workinghardinit.work/2015/10/13/trunking-with-hyper-v-networking/).

One other step I got stuck on was from the guest OS creating its own MAC addresses for the VLAN interfaces. By default the Hyper-V switch disables MAC address spoofing, so that only the Hyper-V specified address is allowed through, but with the guest OS creating its own MACs this setting needs to be disabled. There are of course ways to force interfaces to use a specified MAC instead of generating one, but I didn't want to.
