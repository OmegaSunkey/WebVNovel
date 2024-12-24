package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"encoding/json"
	"slices"
	"strings"
)

var fileArr []string
var windowsFileArr []string

func panickingrn(er error) {
	if er != nil {
		fmt.Println("What happened??? You should have that directory !!!!")
		panic(er)
	}
}

func main() {
	fmt.Println("Listing all resources")
	error := filepath.WalkDir("images", getList)
	panickingrn(error)
	error = filepath.WalkDir("resources", getList)
	panickingrn(error)
	error = filepath.WalkDir("scenes", getList)
	panickingrn(error)
	
	fmt.Println(fileArr)
	
	windowsmoment := slices.ContainsFunc(fileArr, func(str string) bool {
		if strings.Contains(str, "\\") {
			return true
		}
		return false
	})
	
	if windowsmoment {
		fmt.Println("Seems like you're using Windows... removing backslash")
		forWindowsFileArr(fileArr)
	}
	
	fmt.Println("Converting to JSON type array...")
	jsonArr, err := json.Marshal(fileArr)
	panickingrn(err)
	
	fileerr := os.Remove("resources.json")
	if fileerr != nil {
		fmt.Println("Cannot remove resources.json")
	}
	
	config, err := os.OpenFile("resources.json", os.O_CREATE|os.O_WRONLY, 0644)
	defer config.Close()
	panickingrn(err)
	
	fmt.Println("Writing to resources.json")
	if _, err := config.Write(jsonArr); err != nil {
		config.Close()
		panic(err)
	}
	
}

//taken from GoByExample.com https://gobyexample.com/directories
func getList(path string, d fs.DirEntry, err error) error {
	if err != nil {
		return err
	}
	if d.IsDir() || strings.Contains(d.Name(), "Thumbs.db") {
		return nil
	}
	
	fmt.Println(" ", path)
	fileArr = append(fileArr, path)
	
	return nil
}

func forWindowsFileArr(slc []string) {
	for k, val := range slc {
		slc[k] = strings.Replace(val, "\\", "/", -1)
	}
}