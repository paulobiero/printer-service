using System;
using System.ServiceProcess;

class Program {
    static void Main(string[] args) {
        string serviceName = "MyService";
        string executablePath = @"C:\path\to\your\app.exe";

        // Install the service
        var sc = new ServiceController(serviceName);
        System.Diagnostics.Process.Start("sc.exe", $"create {serviceName} binPath= \"{executablePath}\"");

        // Start the service
        sc.Start();
        Console.WriteLine("Service installed and started successfully.");
    }
}
