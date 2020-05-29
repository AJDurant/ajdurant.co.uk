---
layout: post
title: Windows Wake-on-LAN deployment
date: 2020-05-11
tags:
    - windows
    - powershell
    - deployment
---

I needed to get Wake-on-LAN (WoL) settings enabled in Windows via a script, to deploy across a fleet of PCs. There a a number of different ways to do this, and a lot of the ones I found involved [WMI](https://devblogs.microsoft.com/scripting/configure-a-network-adapter-to-wake-a-computer-via-powershell/) or [VBS](https://community.spiceworks.com/scripts/show/240-script-to-enable-wake-on-lan-windows) or [registry](https://mickitblog.blogspot.com/2019/01/powershell-one-liner-to-configure-nic.html) [editing](https://community.spiceworks.com/topic/2239276-script-help-to-disable-power-management-on-network-cards). Ideally (for me) there would be a pure PowerShell solution, and initially it seemed there might be: [Enable-NetAdapterPowerManagement](https://docs.microsoft.com/en-us/powershell/module/netadapter/enable-netadapterpowermanagement). However, this cmdlet is able to Enable various advanced features of network cards, it does not modify the basic plug-and-play (PnP) device power management features that are also required. A starting point, but not enough.

The tool [powercfg](https://stackoverflow.com/questions/11750071/how-do-i-enable-allow-this-device-to-wake-the-computer-programmatically) is able to configure PnP power management, but only toggles the "Allow this device to wake the computer" option and not the "Only allow a magic packet to wake the computer" option. So it was going to have to be registry editing after all.

Microsoft documents the differing values for the PnP power management setting, [PnPCapabilities](https://support.microsoft.com/en-us/help/2740020/information-about-power-management-setting-on-a-network-adapter). In my case I want all three boxes ticked, so the DWORD value is 256. [Mick's PowerShell one-liner](https://mickitblog.blogspot.com/2019/01/powershell-one-liner-to-configure-nic.html) seemed the simplest basis, but wasn't correctly picking up my adapters, and didn't work at all with multiple adapters, so I adapted it a bit for my script.

Combining these two sorts out the Windows side of WoL. However there is still motherboard configuration to deal with. Dell have an online tool for setting BIOS configuration options: [Dell Command | Configure](https://www.dell.com/support/article/en-uk/sln311302/dell-command-configure) with this you can create an executable to modify the settings directly without having to reboot the PC into setup mode, and manually configure every machine. [Dell's WoL guide](https://www.dell.com/support/article/en-uk/sln305365/how-to-setup-wake-on-lan-wol-on-your-dell-system) details the general steps, but not any automation of them. PCs that support it also need the [Deep-Sleep option disabled](https://www.dell.com/support/article/en-uk/sln307243/newer-dell-system-models-will-not-wake-on-lan-with-deep-sleep-control-set-to-s5-in-the-windows).

Fast startup also needs to be disabled, as this sets the PC into a power state that where the network card is turned off. Fast startup is feature of Windows that changes the shut down mode from halting the PC to a hybrid hibernation state. This is not quite the same as hibernating, with hibernation there is an expectation of some power draw, but when you shut down your PC you expect no power draw - at least that is Microsoft's logic. Therefore, when fast startup is enabled and Windows goes into its hiberboot state it sends signals to power off devices including network cards, even if you have configured them to be on for Wake-on-LAN purposes.

```powershell
<#
.SYNOPSIS
    Enables WoL on NICs and in Dell BIOS settings
.DESCRIPTION
    Sets the WoL and Power Management settings for each physical NIC
    then runs a Dell Command | Configure exe to set:
        cctk - deepsleepctrl=disable
        cctk - wakeonlan=enable
.NOTES
    File Name      : Enable-WoL.ps1
    Author         : Andy Durant
    Copyright 2020 - AJDurant
.EXAMPLE
    Enable-WoL.ps1
#>

# Self-elevate the script
If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))
{
  # Relaunch as an elevated process:
  Start-Process powershell.exe "-File",('"{0}"' -f $MyInvocation.MyCommand.Path) -Verb RunAs -Wait
  exit
}

$PnPValue=256
$Adapters=Get-NetAdapter -Physical
$KeyPath='HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4D36E972-E325-11CE-BFC1-08002bE10318}\'
$ExitCode = 0

Get-NetAdapterPowerManagement | Enable-NetAdapterPowerManagement -WakeOnMagicPacket -WakeOnPattern

foreach ($Adapter in $Adapters) {
    foreach ($Entry in (Get-ChildItem $KeyPath -ErrorAction SilentlyContinue).Name) {
        If ((Get-ItemProperty REGISTRY::$Entry).ComponentId -eq $Adapter.ComponentId) {
            Write-Host "$($Adapter.InterfaceDescription)"
            $Value=(Get-ItemProperty REGISTRY::$Entry).PnPCapabilities
            If ($Value -ne $PnPValue) {
                Set-ItemProperty -Path REGISTRY::$Entry -Name PnPCapabilities -Value $PnPValue -Force
                Disable-PnpDevice -InstanceId $Adapter.PnPDeviceID -Confirm:$false
                Enable-PnpDevice -InstanceId $Adapter.PnPDeviceID -Confirm:$false
                $Value=(Get-ItemProperty REGISTRY::$Entry).PnPCapabilities
            }
            If ($Value -eq $PnPValue) {
                Write-Host '  Configuring power management was successful'
            } Else {
                Write-Host '  Configuring power management failed'
                $ExitCode = 1
            }
        }
    }
}

# Disable Fast Boot
Set-ItemProperty -Path REGISTRY::'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled -Value 0 -Force

# Set BIOS settings
Start-Process -FilePath ./dell_enable_wol.exe -Wait
Get-Content -Path .\dell_enable_wol.txt

Exit $ExitCode
```
